// agent-02 (AI agent), Lumen — browser QA of the current two comparison candidates.
// This is a mechanical smoke test, NOT a human playtest or a "fun" score.
// Run from repository root with Playwright installed:
// node qa/agent-02/browser-smoke.mjs
import assert from "node:assert/strict";
import {mkdir, writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {chromium} from "playwright";

const root=process.cwd();
const artifacts=resolve(root,"qa-artifacts","agent-02");
await mkdir(artifacts,{recursive:true});
const report={author:"agent-02 (AI agent)",timestamp:new Date().toISOString(),environment:"Chromium via Playwright",results:[]};
const candidates=[
  {id:"glass-kelp",url:pathToFileURL(resolve(root,"glass-kelp","storage/personal/agent-04/glass-kelp-integrated/index.html")).href},
  {id:"borrowed-weather",url:pathToFileURL(resolve(root,"borrowed-weather","storage/personal/agent-01/borrowed-weather/index.html")).href}
];
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});

async function demand(condition,reason){
  assert.ok(await condition(),reason);
}
async function isVisible(page,selector){return page.locator(selector).isVisible();}
async function isEnabled(page,selector){return page.locator(selector).isEnabled();}
async function noOverflow(page){
  return page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2);
}
async function focusIs(page,id){
  return page.evaluate(id=>document.activeElement?.id===id,id);
}
async function withPage(id,url,fn,options={}){
  const context=await browser.newContext({viewport:{width:options.mobile?375:1280,height:options.mobile?812:900},reducedMotion:"reduce"});
  const page=await context.newPage();
  const exceptions=[];
  page.on("pageerror",e=>exceptions.push(e.message));
  const result={candidate:id,mode:options.mobile?"mobile":"desktop",passed:false,checks:[],exceptions};
  const check=async (name,condition)=>{
    await demand(condition,name);
    result.checks.push(name);
  };
  try{
    await page.goto(url,{waitUntil:"load"});
    await fn({page,check});
    await check("No unhandled JavaScript exceptions",()=>exceptions.length===0);
    await check("No horizontal page overflow",()=>noOverflow(page));
    result.passed=true;
  }catch(error){
    result.error=error.stack||String(error);
  }finally{
    const suffix=options.mobile?"mobile":"desktop";
    try{await page.screenshot({path:resolve(artifacts,id+"-"+suffix+".png"),fullPage:true});}
    catch(error){result.screenshotError=String(error);}
    await context.close();
    report.results.push(result);
    console.log((result.passed?"PASS":"FAIL")+" "+id+" "+suffix+" — "+result.checks.length+" checks");
    if(!result.passed)console.error(result.error);
  }
}
const glass=candidates[0].url;
const weather=candidates[1].url;

await withPage("glass-kelp",glass,async({page,check})=>{
  await check("Tower locked before context",async()=>{
    return !(await isEnabled(page,"#tower-button"));
  });
  await check("Three location buttons visible",async()=>{
    return (await page.locator('.place-button[data-place="harbor"],.place-button[data-place="garden"],.place-button[data-place="lock"]').count())===3;
  });
  for(const place of ["harbor","garden","lock"]){
    await page.locator('.place-button[data-place="'+place+'"]').click();
    await check("Read "+place,async()=>{
      return (await page.locator("#scene-fact").innerText()).includes("Decision fact");
    });
  }
  await check("Tower unlocked after context",()=>isEnabled(page,"#tower-button"));
  await page.locator("#tower-button").click();
  await check("4x4 relay board rendered",async()=>{
    return await page.locator("#relay-grid .relay-tile").count()===16;
  });
  const state=await page.evaluate(()=>{
    const relay=globalThis.GKRelay;
    return {start:[...relay.PUZZLE_START],solution:[...relay.SOLUTION_FIXTURES.AAB]};
  });
  await check("AAB witness available from real relay module",()=>state.start.length===16&&state.solution.length===16);
  for(let cell=0;cell<16;cell++){
    const turns=(state.solution[cell]-state.start[cell]+4)%4;
    for(let turn=0;turn<turns;turn++){
      await page.locator('.relay-tile[data-cell="'+cell+'"]').click();
      await check("Rotated tile "+cell+" (turn "+(turn+1)+")",async()=>{
        const label=await page.locator('.relay-tile[data-cell="'+cell+'"]').getAttribute("aria-label");
        return !!label?.includes("Row");
      });
    }
  }
  await check("Clean AAB network enables transmit",async()=>{
    return (await isEnabled(page,"#transmit-button")) &&
      (await page.locator("#pattern-note").innerText()).includes("AAB");
  });
  await page.locator("#transmit-button").click();
  await check("Transmission results in aftermath phase",async()=>{
    return (await page.locator("#phase-label").innerText())==="aftermath" &&
      (await isVisible(page,"#transmission-banner"));
  });
  await check("Focus moves to result heading",()=>focusIs(page,"scene-title"));
  for(const place of ["harbor","garden","lock"]){
    await page.locator('.place-button[data-place="'+place+'"]').click();
    await check("Aftermath scene for "+place,async()=>{
      const label=(await page.locator("#scene-eyebrow").textContent())?.trim()||"";
      const phase=(await page.locator("#phase-label").textContent())?.trim()||"";
      const visible=await isVisible(page,"#scene-panel");
      if(!label.includes("after transmission") || phase!=="aftermath" || !visible){
        throw new Error("Expected after-scene for "+place+"; observed "+JSON.stringify({label,phase,visible}));
      }
      return true;
    });
  }
  await page.locator("#tower-button").click();
  await check("Final echo and artifact visible",async()=>{
    return await isVisible(page,"#echo-panel") &&
      (await page.locator("#artifact-name").innerText()).includes("Root vial") &&
      (await page.locator("#impact-benefit").innerText()).length>15 &&
      (await page.locator("#impact-strain").innerText()).length>15;
  });
  await check("Echo receives keyboard focus",()=>focusIs(page,"echo-title"));
  if(await isEnabled(page,"#tower-button")){
    await page.locator("#tower-button").click();
    await check("Final echo cannot accidentally reopen routing",async()=>{
      return await isVisible(page,"#echo-panel") && !(await isVisible(page,"#tower-panel"));
    });
  }
  await page.locator("#restart-button").click();
  await check("Restart resets to arrival context",async()=>{
    return (await page.locator("#phase-label").innerText())==="context" &&
      (await page.locator("#visit-label").innerText())==="0 / 3" &&
      !(await isEnabled(page,"#tower-button"));
  });
  await check("Restart restores visible keyboard focus",()=>focusIs(page,"scene-title"));
});

// Each supported first-island source pattern must survive the COMPLETE browser path.
// The towerOnly mode omits pre-context solely to reduce automated repetition.
for(const pattern of ["AAA","ABB","BBB"]){
  await withPage("glass-kelp-"+pattern,glass+"?towerOnly=1",async({page,check})=>{
    await check("Tower-only control starts at live switchboard",async()=>{
      return (await page.locator("#phase-label").textContent())?.trim()==="routing" &&
        await isVisible(page,"#tower-panel");
    });
    const fixture=await page.evaluate(pattern=>{
      const model=globalThis.GKRelay;
      return {start:[...model.PUZZLE_START],end:[...model.SOLUTION_FIXTURES[pattern]]};
    },pattern);
    for(let cell=0;cell<16;cell++){
      const turns=(fixture.end[cell]-fixture.start[cell]+4)%4;
      for(let i=0;i<turns;i++)
        await page.locator('.relay-tile[data-cell="'+cell+'"]').click();
    }
    await check("Fully routed "+pattern+" is transmit-ready",async()=>{
      return await isEnabled(page,"#transmit-button") &&
        (await page.locator("#pattern-note").textContent())?.includes(pattern);
    });
    await check("Preview exactly matches authored "+pattern+" sentence",async()=>{
      const wanted=await page.evaluate(p=>globalThis.GKContent.sentenceFor(p),pattern);
      return (await page.locator("#assembled-sentence").textContent())?.trim()===wanted;
    });
    await page.locator("#transmit-button").click();
    for(const place of ["harbor","garden","lock"]){
      await page.locator('.place-button[data-place="'+place+'"]').click();
      await check(pattern+" consequence shown at "+place,async()=>{
        const expected=await page.evaluate(([location,p])=>globalThis.GKContent.afterScene(location,p).title,[place,pattern]);
        return (await page.locator("#scene-title").textContent())?.trim()===expected;
      });
    }
    await page.locator("#tower-button").click();
    await check(pattern+" has its own echo",async()=>{
      const expected=await page.evaluate(p=>globalThis.GKContent.ECHOES[p].title,pattern);
      return await isVisible(page,"#echo-panel") &&
        (await page.locator("#echo-title").textContent())?.trim()===expected;
    });
    await check(pattern+" has specific benefit and strain",async()=>{
      const expected=await page.evaluate(p=>globalThis.GKContent.IMPACTS[p],pattern);
      return (await page.locator("#impact-benefit").textContent())?.trim()===expected.benefit &&
        (await page.locator("#impact-strain").textContent())?.trim()===expected.strain;
    });
  });
}

await withPage("glass-kelp",glass,async({page,check})=>{
  await check("Mobile landing area readable",()=>isVisible(page,"#scene-title"));
  await check("Tower initially locked on mobile",async()=>!(await isEnabled(page,"#tower-button")));
  for(const place of ["harbor","garden","lock"])
    await page.locator('.place-button[data-place="'+place+'"]').click();
  await page.locator("#tower-button").click();
  await check("All sixteen relay tiles remain present at 375px",async()=>await page.locator(".relay-tile").count()===16);
  await check("Tile exposes keyboard-accessible text",async()=>{
    const first=await page.locator(".relay-tile").first().getAttribute("aria-label");
    return first?.includes("Activate to rotate")===true;
  });
},{mobile:true});

await withPage("borrowed-weather",weather,async({page,check})=>{
  await check("First day starts with three distinct weather stamps",async()=>{
    return await page.locator("button.stamp").count()===3 &&
      (await page.locator("#day-ticket").innerText()).includes("01");
  });
  const sequence=["rain","wind","sun","rain","wind"];
  for(let day=0;day<sequence.length;day++){
    await page.locator('button.stamp[data-weather="'+sequence[day]+'"]').click();
    await check("Day "+(day+1)+" choice produces authored result",async()=>{
      return await isVisible(page,".result-card") &&
        (await page.locator(".result-card p").last().innerText()).length>30;
    });
    await page.getByRole("button",{name:day===sequence.length-1?"Read the closing ledger":"Open the next morning"}).click();
  }
  await check("Five-day story reaches closing ledger",async()=>{
    return (await page.locator("#day-ticket").innerText())==="LEDGER COMPLETE" &&
      await page.locator(".epilogue").isVisible();
  });
  await check("Closing ledger cannot show a sixth weather stamp",async()=>{
    return await page.locator("button.stamp").count()===0;
  });
  await page.getByRole("button",{name:"Undo the last stamp"}).click();
  await check("Undo restores the fifth day's decision controls",async()=>{
    return await page.locator("button.stamp").count()===3 &&
      !(await isVisible(page,".epilogue"));
  });
  await check("Undo exposes a still-readable current day",async()=>{
    return (await page.locator("#day-ticket").innerText()).includes("05");
  });
});

await withPage("borrowed-weather",weather,async({page,check})=>{
  await check("Weather controls remain available at 375px",async()=>{
    return await page.locator("button.stamp").count()===3;
  });
  await page.locator('button.stamp[data-weather="rain"]').click();
  await check("Mobile first choice shows consequence",()=>isVisible(page,".result-card"));
},{mobile:true});

await browser.close();
await writeFile(resolve(artifacts,"report.json"),JSON.stringify(report,null,2)+"\n");
const failed=report.results.filter(r=>!r.passed);
console.log("Browser QA: "+(report.results.length-failed.length)+"/"+report.results.length+" scenarios passed");
if(failed.length)process.exitCode=1;
