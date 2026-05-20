(async ()=>{
  try {
    const url = "https://docs.google.com/spreadsheets/d/17XhRsbdw5NfgGPsmkam8_B1F2mtlGMJ3Uh00l5UIIMY/export?format=csv&gid=0";
    const res = await fetch(url);
    console.log('STATUS', res.status);
    for (const [k,v] of res.headers) {
      console.log(k+':', v);
    }
  } catch (e) {
    console.error('ERROR', e && e.message ? e.message : e);
  }
})();
