const got = require('got');
const schedule = require('node-schedule');
const { Webhook, MessageBuilder } = require('discord-webhook-node');

const hook = new Webhook('https://discord.com/api/webhooks/');

function unescape(html) {
    let returnText = decodeURIComponent(html);
    returnText = returnText.replace(/&nbsp;/gi, " ");
    returnText = returnText.replace(/&amp;/gi, "&");
    returnText = returnText.replace(/&quot;/gi, `"`);
    returnText = returnText.replace(/&#039;/gi, "'");
    returnText = returnText.replace(/&lt;/gi, "<");
    returnText = returnText.replace(/&gt;/gi, ">");
    return returnText;
}

async function getHotReleases() {

    const { body } = await got("https://www.sivasdescalzo.com/en/hot-releases");

    let releaseRegex = /<li class="item product product-item grid-col">[\S\s]*?href="(?<shoe_link>[^"]+?)"[\S\s]*?src="(?<thumbnail>[^"]+?)"[\S\s]*?product-card__title">[^>]+?>(?<brand>[^<]+?)<\/a>[\S\s]*?product-card__short-desc">[^>]+?>(?<model>[^<]+?)<\/a>[\S\s]*?product-card__price[\S\s]*?data-product-id="(?<pid>[^"]+?)"[\S\s]*?data-price-amount="(?<price>[^"]+?)"[\S\s]*?product-state__tag">(?<release_date>[^<]+?)<[\S\s]*?<\/li>/g;

    let hot_releases = body.matchAll(releaseRegex);

    for (hot_release of hot_releases) {

        let { shoe_link, thumbnail, brand, model, pid, price, release_date} = hot_release.groups;

        brand = unescape(brand)
        model = unescape(model)
        price = parseFloat(price).toFixed(2)

        console.log(`${brand} ${model} will drop ${release_date != "Raffle" ? "on " + release_date : "in Raffle mode"} at ${price} €`)

        const embed = new MessageBuilder()
            .setAuthor('SVD Monitor',
                        'https://yt3.ggpht.com/a/AATXAJyNgWPZAeCW6YaveajAGyC5wVeyGRt6mj8Lcw=s900-c-k-c0xffffffff-no-rj-mo',
                        'https://www.sivasdescalzo.com/en/hot-releases')
            .addField('Brand', brand, true)
            .addField('Model', model, true)
            .addField('Price', `${price} €`, true)
            .addField('PID', pid, true)
            .addField('Product Link', shoe_link, true)
            .addField('Release date', release_date, true)
            .setColor('#f7f1e3')
            .setFooter('Monitor by OXDBXKXO')
            .setTimestamp()
            
        hook.send(embed)
    }
}

// Run everyday at 8h50
const job = schedule.scheduleJob('50 8 * * *', function(){
    getHotReleases()
});