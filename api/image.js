export default async function handler(request,response){
 const imageId = request.query.id;
 const size = request.query.size;
 if(typeof imageId !== "string" || typeof size !== "string"){
    return response.status(400).json({error:"Invalid image parameters"});
 }
 if(size !== "400," && size !== "843,"){
    return response.status(400).json({error:"Invalid image size"});
 }
 const imageUrl = "https://www.artic.edu/iiif/2/" + encodeURIComponent(imageId) + "/full/" + size + "/0/default.jpg";
 try{
  const imageResponse = await fetch(imageUrl,{headers:{"AIC-User-Agent":"art-gallery-browser (local learning project)"},signal:AbortSignal.timeout(10000)});
  if(!imageResponse.ok){
    return response.status(imageResponse.status).json({error:"Failed to load image"});
  }
  const contentType = imageResponse.headers.get("content-type") ?? "";
  if(!contentType.startsWith("image/")){
    return response.status(502).json({error:"Invalid image response"});
  }
  const imageData = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(imageData);
  response.setHeader("Content-Type",contentType);
  response.setHeader("Cache-Control","public, max-age=86400");
  return response.status(200).send(imageBuffer);
 }catch(error){
  return response.status(502).json({error:"Failed to load image"});
 }
}