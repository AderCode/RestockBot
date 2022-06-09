require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const notify = require('popcornnotify')

const makersNumber = process.env.MAKERS_NUMBER;
class HotTopic {
  constructor(url, size, alertNumber) {
    this.url = url;
    this.size = size;
    this.alertNumber = alertNumber ? alertNumber : makersNumber;
  }

  isInStock = false;

  async crawl() {
    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);
      const targetClasses = `.size-value[aria-describedby="${String(this.size).toUpperCase()}"]`
      const targetSizeBtn = $(targetClasses);

      if(targetSizeBtn[0].attribs.disabled === undefined) {
        // Item/Size is in stock
        if(!this.isInStock) {
          // report item/size is back in stock
          this.isInStock = true;
          notify('2052600400', `Size (${this.size}) is back in stock!

${this.url}`)
        } 
      } else {
        console.log(new Date().toDateString(), " - Item out of stock");
        // Item/Size Out of Stock
        if(this.isInStock) {
          this.isInStock = false;
        }
      }
    } catch (error) {
      notify("2052600400", "RestockBot has encountered an error!")
      console.error("error", error);
    }
  }
}

const url = `https://www.hottopic.com/product/her-universe-star-wars-obi-wan-kenobi-hooded-jedi-dress/17288582.html`;
const size = `xs`;
const alertNumber = process.env.ALERT_NUMBER;

const HTCrawler = new HotTopic(url, size, alertNumber);

setInterval(() => {
  HTCrawler.crawl()
}, 300000);

HTCrawler.crawl()

console.log(new Date().toDateString(), " - RestockBot has come Online");

notify([makersNumber, alertNumber], `${new Date().toDateString()}
RestockBot has come Online

Watching for size: ${String(size).toUpperCase()}

${url}`)
