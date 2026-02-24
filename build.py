import re

# ------------- INDEX.HTML -------------
with open("stitch_designs/stitch_leverage_in_the_game_basketball_coaching_website/leverage_in_the_game_sales_page_3/code.html", "r") as f:
    idx_code = f.read()

# Nav link
idx_code = idx_code.replace(
    '''<button class="bg-primary text-background-dark px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-white transition-all transform active:scale-95">
          Get the Guide
        </button>''',
    '''<a href="#lead" class="bg-primary text-background-dark px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-white transition-all transform active:scale-95 text-center flex items-center justify-center">
          Get the Guide
        </a>'''
)

# Hero Form
idx_code = idx_code.replace(
    '''<div class="flex flex-col sm:flex-row gap-3 max-w-md">
<input class="flex-1 bg-white/5 border border-white/10 rounded-lg px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Enter your email" type="email"/>
<button class="bg-primary text-background-dark px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-white transition-all whitespace-nowrap">
            Access Guide
          </button>
</div>''',
    '''<form class="flex flex-col sm:flex-row gap-3 max-w-md" data-lead-form data-auth-otp="true" data-redirect="thank-you.html">
<input name="name" type="hidden" value="Interested Player"/>
<input name="email" class="flex-1 bg-white/5 border border-white/10 rounded-lg px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Enter your email" type="email" required/>
<button type="submit" class="bg-primary text-background-dark px-8 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-white transition-all whitespace-nowrap">
            Access Guide
          </button>
</form>'''
)

# Bottom Form
idx_code = idx_code.replace(
    '''<form class="space-y-4">''',
    '''<form id="lead" class="space-y-4" data-lead-form data-auth-otp="true" data-redirect="thank-you.html">'''
)
idx_code = idx_code.replace(
    '''<input class="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary outline-none" placeholder="John Doe" type="text"/>''',
    '''<input name="name" class="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary outline-none" placeholder="John Doe" type="text" required/>'''
)
idx_code = idx_code.replace(
    '''<input class="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary outline-none" placeholder="john@athlete.com" type="email"/>''',
    '''<input name="email" class="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary outline-none" placeholder="john@athlete.com" type="email" required/>'''
)
idx_code = idx_code.replace(
    '''<button class="w-full bg-primary text-background-dark font-oswald text-xl font-bold uppercase py-4 rounded-lg tracking-widest hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg shadow-primary/20 mt-4">
            Get Instant Access
          </button>''',
    '''<button type="submit" class="w-full bg-primary text-background-dark font-oswald text-xl font-bold uppercase py-4 rounded-lg tracking-widest hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg shadow-primary/20 mt-4">
            Get Instant Access
          </button>'''
)

# Replace scripts
idx_code = idx_code.replace(
    '''</body>''',
    '''<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/config.js"></script>
<script src="js/script.js"></script>
</body>'''
)

with open("index.html", "w") as f:
    f.write(idx_code)

# ------------- CHECKOUT.HTML -------------
with open("stitch_designs/stitch_leverage_in_the_game_basketball_coaching_website/leverage_in_the_game_sales_page_5/code.html", "r") as f:
    chk_code = f.read()

chk_code = chk_code.replace(
    '''<a class="text-xs uppercase font-bold text-slate-400 hover:text-primary transition-colors" href="#">Back</a>''',
    '''<a class="text-xs uppercase font-bold text-slate-400 hover:text-primary transition-colors" href="index.html">Back</a>'''
)

chk_code = chk_code.replace(
    '''<button class="w-full bg-primary text-background-dark h-16 rounded-xl font-oswald text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(183,217,89,0.3)]">
<span class="material-symbols-outlined font-normal">shopping_cart</span>
                Buy Now with Stripe
            </button>''',
    '''<a href="#" data-stripe-link aria-disabled="true" class="w-full bg-primary text-background-dark h-16 rounded-xl font-oswald text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(183,217,89,0.3)]">
<span class="material-symbols-outlined font-normal">shopping_cart</span>
                Buy Now with Stripe
            </a>'''
)

chk_code = chk_code.replace(
    '''<button class="w-full bg-primary text-background-dark h-14 rounded-lg font-oswald text-lg font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                Unlock Access — $149
            </button>''',
    '''<a href="#" data-stripe-link aria-disabled="true" class="w-full bg-primary text-background-dark flex items-center justify-center h-14 rounded-lg font-oswald text-lg font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                Unlock Access — $149
            </a>'''
)

# Replace scripts
chk_code = chk_code.replace(
    '''</body>''',
    '''<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/config.js"></script>
<script src="js/script.js"></script>
</body>'''
)

with open("checkout.html", "w") as f:
    f.write(chk_code)

# ------------- THANK YOU.HTML -------------
with open("stitch_designs/stitch_leverage_in_the_game_basketball_coaching_website/leverage_in_the_game_sales_page_1/code.html", "r") as f:
    ty_code = f.read()

ty_code = ty_code.replace(
    '''<button class="bg-primary text-background-dark px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white transition-all active:scale-95">
            Get Full Guide
        </button>''',
    '''<a href="checkout.html" class="bg-primary text-background-dark px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white transition-all active:scale-95 flex items-center justify-center">
            Get Full Guide
        </a>'''
)

ty_code = ty_code.replace(
    '''<button class="w-full bg-primary text-background-dark font-oswald text-xl font-bold uppercase py-4 rounded-xl tracking-widest hover:bg-white transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20">
                    Get The Full Guide
                </button>''',
    '''<a href="checkout.html" class="w-full bg-primary text-background-dark font-oswald text-xl font-bold uppercase py-4 rounded-xl tracking-widest hover:bg-white transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center">
                    Get The Full Guide
                </a>'''
)

# Replace scripts
ty_code = ty_code.replace(
    '''</body>''',
    '''<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/config.js"></script>
<script src="js/script.js"></script>
</body>'''
)

with open("thank-you.html", "w") as f:
    f.write(ty_code)

print("Pages generated successfully.")
