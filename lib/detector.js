const axios = require('axios');
const cheerio = require('cheerio');

async function detectPlatform(url) {
  try {
    console.log(`Checking platform for URL: ${url}`);
    // Normalize URL
    url = url.replace(/\/$/, '');
    if (!url.startsWith('http')) {
      url = 'http://' + url;
    }
    if (!url.endsWith('/')) {
      url += '/';
    } 
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'PlatformDetectorBot/1.0' },
      timeout: 10000
    });

    const headers = Object.fromEntries(
      Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), v])
    );

    const cookies = (res.headers['set-cookie'] || []).map(c => c.toLowerCase());
    const html = res.data;
    const $ = cheerio.load(html);

    const metaGen = $('meta[name="generator"]').attr('content')?.toLowerCase() || '';

    // Magento
    if (metaGen.includes('magento')) return 'Magento';
    if (cookies.some(c => c.includes('mage-') || c.includes('form_key') || c.includes('phpsessid') || c.includes('store'))) return 'Magento';
    if (html.includes('/static/') || html.includes('/pub/static/') || html.includes('mage/apply/main.js')) return 'Magento';
    if ('x-magento-vary' in headers) return 'Magento';

    // Shopify
    if (cookies.some(c => c.includes('_shopify')) || Object.keys(headers).some(h => h.includes('shopify'))) return 'Shopify';

    // WooCommerce
    if (metaGen.includes('woocommerce')) return 'WooCommerce';
    if (cookies.some(c => c.includes('woocommerce'))) return 'WooCommerce';
    if (html.toLowerCase().includes('woocommerce')) return 'WooCommerce';

    // WordPress
    if (metaGen.includes('wordpress')) return 'WordPress';
    if (html.includes('wp-content') || html.includes('wp-includes')) return 'WordPress';

    return 'Unknown';

  } catch (error) {
    return 'Error';
  }
}

module.exports = { detectPlatform };