from django.http import HttpResponse
from django.utils.timezone import now
from django.conf import settings
from django.utils.text import slugify
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
        # ("/product-details", "monthly", "0.7"),
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
        products = PartImageGallery.objects.all()
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
        brands = Manufacturer.objects.all()
        for brand in brands:
            # Generate brand slug from name or use existing slug field
            if hasattr(brand, 'slug') and brand.slug:
                brand_slug = brand.slug.lower()
            elif hasattr(brand, 'name') and brand.name:
                brand_slug = slugify(brand.name).lower()
            else:
                continue  # Skip if no slug/name available
            
            # Generate both URL patterns matching React routes
            # Route 1: /used-:brandSlug-parts (e.g., /used-buick-parts)
            # brand_url_1 = f"/used-{brand_slug}-parts"
            
            # Route 2: /used/:brandSlug/parts (e.g., /used/buick/parts)
            brand_url_2 = f"/used/{brand_slug}/parts"

            xml += f"""
    <url>
        <loc>{base_url}{brand_url_2}</loc>
        <lastmod>{now().date()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
                """
    except Exception as e:
        print(f"Error adding brands to sitemap: {e}")

    xml += "\n</urlset>"

    return HttpResponse(xml, content_type="application/xml")