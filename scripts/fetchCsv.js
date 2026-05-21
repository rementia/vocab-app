(async ()=>{
  try {
    const url = "https://docs.google.com/spreadsheets/d/17XhRsbdw5NfgGPsmkam8_B1F2mtlGMJ3Uh00l5UIIMY/export?format=csv&gid=0";
    const res = await fetch(url);
    console.log('STATUS', res.status);
    const txt = await res.text();
    console.log('LENGTH', txt.length);
    console.log('HEAD:\n', txt.slice(0,1000));
  } catch (e) {
    console.error('ERROR', e && e.message ? e.message : e);
  }
})();
