export default async function Dates(){
  //TURN ON logging.fetches.fullUrl:true in next.config.js to see cache hits and misses
  // let currentTime = (await get('http://worldtimeapi.org/api/timezone/America/Chicago', {})).data.datetime; //TODO set this up with lib
  let cacheCurrentTime = (await ( await fetch('http://worldtimeapi.org/api/timezone/America/Chicago') ).json() ).datetime; //completely-cached
  let noCacheCurrentTime = (await ( await fetch('http://worldtimeapi.org/api/timezone/America/Chicago', {cache:'no-store'}) ).json() ).datetime; //disable cache
  let revalidateCurrentTime = (await ( await fetch('http://worldtimeapi.org/api/timezone/America/Chicago', {next:{revalidate: 5}}) ).json() ).datetime; //nextjs-specific - revalidate -> incremental static regeneration
  return (
    <div style={{backgroundColor:'ghostwhite', marginBottom: 20}}>
      <p style={{justifySelf:'flex-end'}}>{cacheCurrentTime} (cache)</p>
      <p style={{justifySelf:'flex-end'}}>{noCacheCurrentTime} (no-cache)</p>
      <p style={{justifySelf:'flex-end'}}>{revalidateCurrentTime} (revalidate)</p>
    </div>
  );
}