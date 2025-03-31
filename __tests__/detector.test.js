const { detectPlatform } = require('../lib/detector');
const axios = require('axios');
jest.mock('axios');

describe('Platform Detection', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('detects Magento from meta tag', async () => {
    axios.get.mockResolvedValue({
      data: '<meta name="generator" content="Magento 2">',
      headers: { 'set-cookie': [], 'x-magento-vary': '*' }
    });

    const platform = await detectPlatform('https://example-magento.com');
    expect(platform).toBe('Magento');
  });

  it('detects Shopify from cookies', async () => {
    axios.get.mockResolvedValue({
      data: '<html></html>',
      headers: {
        'set-cookie': ['_shopify_s=abc123;'],
        'x-shopify-stage': 'production'
      }
    });

    const platform = await detectPlatform('https://example-shopify.com');
    expect(platform).toBe('Shopify');
  });

  it('detects WooCommerce from meta tag', async () => {
    axios.get.mockResolvedValue({
      data: '<meta name="generator" content="WooCommerce">',
      headers: { 'set-cookie': [] }
    });

    const platform = await detectPlatform('https://example-woo.com');
    expect(platform).toBe('WooCommerce');
  });

  it('detects WordPress from HTML path', async () => {
    axios.get.mockResolvedValue({
      data: '<script src="/wp-content/themes/some-theme/script.js"></script>',
      headers: { 'set-cookie': [] }
    });

    const platform = await detectPlatform('https://example-wp.com');
    expect(platform).toBe('WordPress');
  });

  it('returns Unknown when no signature matches', async () => {
    axios.get.mockResolvedValue({
      data: '<html><head><title>No CMS</title></head><body>Hello</body></html>',
      headers: {}
    });

    const platform = await detectPlatform('https://example-unknown.com');
    expect(platform).toBe('Unknown');
  });

  it('returns Error on network failure', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    const platform = await detectPlatform('https://example-fail.com');
    expect(platform).toBe('Error');
  });
});