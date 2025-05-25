import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function downloadPreviewPages(previewUrl: string,uuid:string) {
  const browser = await puppeteer.launch({
    headless: false, 
    args: [
      '--start-maximized',
      '--disable-web-security',
      '--allow-running-insecure-content'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36');
  await page.goto(previewUrl, { waitUntil: 'networkidle2' });
await new Promise(resolve => setTimeout(resolve, 3000));
  const gbppdScript = fs.readFileSync(path.resolve(__dirname, 'gbppd-mini.js'), 'utf8');
  await page.evaluate(gbppdScript);
  //ts ignore because that exist in different script 
  //@ts-ignore
  await page.evaluate(() => gbppd.start());
await new Promise(resolve => setTimeout(resolve, 60000));
//@ts-ignore
  const imageUrls = await page.evaluate(() => gbppd.finish());

  console.log(`Found ${imageUrls.length} images`);

  const downloadDir = path.join(__dirname, uuid);
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
  let i=0;
  for (let url of imageUrls) {
    if(!url)
      return;
    const imageUrl = url;
    let viewSource
    try{
     viewSource = await page.goto(imageUrl);
    }catch(error){
      console.log(error)
      console.log(url)
      continue;
    }
    if(!viewSource){
      continue
    }
    const buffer = await viewSource.buffer();
    const filePath = path.join(downloadDir, `${uuid}_${i + 1}.jpg`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Downloaded: ${filePath}`);
    i++;
  }

  await browser.close();
}
