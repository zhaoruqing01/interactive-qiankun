# 爬虫核心逻辑
class HouseSpider(scrapy.Spider):
    name = 'house_spider'
    allowed_domains = ['二手房网站域名']
    start_urls = ['各城市房源列表页URL']
    
    def parse(self, response):
        # 解析房源列表页面
        house_list = response.xpath('//div[@class="house-item"]')
        for house in house_list:
            house_item = HouseItem()
            # 提取房源基本信息
            house_item['title'] = house.xpath('.//h3/text()').extract_first()
            house_item['area'] = house.xpath('.//span[@class="area"]/text()').extract_first()
            house_item['layout'] = house.xpath('.//span[@class="layout"]/text()').extract_first()
            house_item['price'] = house.xpath('.//span[@class="total-price"]/text()').extract_first()
            house_item['unit_price'] = house.xpath('.//span[@class="unit-price"]/text()').extract_first()
            # 提取详情页URL并继续解析
            detail_url = house.xpath('.//a/@href').extract_first()
            yield scrapy.Request(detail_url, callback=self.parse_detail, meta={'house_item': house_item})
        
        # 分页爬取
        next_page = response.xpath('//a[@class="next-page"]/@href').extract_first()
        if next_page:
            yield scrapy.Request(next_page, callback=self.parse)
    
    def parse_detail(self, response):
        # 解析房源详情页，提取周边配套等信息
        house_item = response.meta['house_item']
        house_item['orientation'] = response.xpath('//span[@class="orientation"]/text()').extract_first()
        house_item['decoration'] = response.xpath('//span[@class="decoration"]/text()').extract_first()
        house_item['school_count'] = response.xpath('//span[@class="school-count"]/text()').extract_first()
        yield house_item