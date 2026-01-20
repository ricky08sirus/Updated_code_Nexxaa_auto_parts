# from django.http import HttpResponse
# from django.utils.timezone import now
# from django.conf import settings


# def sitemap_xml(request):
#     # Use production domain or fallback to request domain
#     if settings.DEBUG:
#         base_url = request.build_absolute_uri('/').rstrip('/')
#     else:
#         base_url = "https://nexxaauto.com"

#     static_urls = [
#         "/",
#         "/about",
#         "/contact",
#         "/privacy-policy",
#         "/warranty",
#         "/terms-and-condition",
#     ]

#     xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
#     xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

#     for path in static_urls:
#         xml += f"""
#     <url>
#         <loc>{base_url}{path}</loc>
#         <lastmod>{now().date()}</lastmod>
#         <changefreq>monthly</changefreq>
#         <priority>0.8</priority>
#     </url>
#         """

#     xml += "\n</urlset>"

#     return HttpResponse(xml, content_type="application/xml")

from django.http import HttpResponse
from django.utils.timezone import now
from django.conf import settings
from authentication.models import PartImageGallery, Manufacturer  


def sitemap_xml(request):
    # Use production domain or fallback to request domain
    if settings.DEBUG:
        base_url = request.build_absolute_uri('/').rstrip('/')
    else:
        base_url = "https://nexxaauto.com"

    # Static URLs
    static_urls = [
        ("/", "monthly", "1.0"),
        ("/about", "monthly", "0.8"),
        ("/contact", "monthly", "0.8"),
        ("/privacy-policy", "yearly", "0.5"),
        ("/warranty", "yearly", "0.5"),
        ("/terms-and-condition", "yearly", "0.5"),
        ("/product-details", "monthly", "0.7"),
    ]

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    # Add static URLs
    for path, changefreq, priority in static_urls:
        xml += f"""
    <url>
        <loc>{base_url}{path}</loc>
        <lastmod>{now().date()}</lastmod>
        <changefreq>{changefreq}</changefreq>
        <priority>{priority}</priority>
    </url>
        """

    # Add Product Pages (ProductPage.jsx routes)
    try:
        products = PartImageGallery.objects.all()  # Or add your existing filters
        for product in products:
            if product.slug and product.id:
                product_url = f"/product/{product.slug}/{product.id}"
                xml += f"""
    <url>
        <loc>{base_url}{product_url}</loc>
        <lastmod>{now().date()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
                """
    except Exception as e:
        print(f"Error adding products to sitemap: {e}")

    # Add Brand Pages (BrandDetail.jsx routes)
    try:
        brands = Manufacturer.objects.all()  # Or add your existing filters
        for brand in brands:
            if brand.id:
                # Add both URL patterns as per your App.js routes
                brand_url = f"/brand/{brand.id}"
                brand_url_alt = f"/used-auto-parts/{brand.id}"
                
                xml += f"""
    <url>
        <loc>{base_url}{brand_url}</loc>
        <lastmod>{now().date()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
                """
                
                xml += f"""
    <url>
        <loc>{base_url}{brand_url_alt}</loc>
        <lastmod>{now().date()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
                """
    except Exception as e:
        print(f"Error adding brands to sitemap: {e}")

    xml += "\n</urlset>"

    return HttpResponse(xml, content_type="application/xml")
