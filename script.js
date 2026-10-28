// =====================================================
// CLEAN X CONFIGURATION
// =====================================================
const CONFIG = {
    whatsapp: "919656320458",
    freeKm: 3,
    feePerKm: 50,
    presets: {
        "1bhk": { workers: 2, hours: 3 },
        "3bhk": { workers: 3, hours: 4 },
        "deepVilla": { workers: 4, hours: 6 },
        "commercial": { workers: 5, hours: 8 }
    }
};

const $ = (id) => document.getElementById(id);
const money = (n) => "Rs " + Number(n).toLocaleString("en-IN");

// =====================================================
// MOBILE NAVIGATION
// =====================================================
const menu = $("menu");
const menuBtn = $("menuBtn");

if (menu && menuBtn) {
    menuBtn.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open);
    });

    menu.addEventListener("click", (e) => {
        if (e.target.tagName === "A" || e.target.classList.contains("nav-link-btn")) {
            menu.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });
}

// =====================================================
// DATE & YEAR SETUP
// =====================================================
if ($("year")) {
    $("year").textContent = new Date().getFullYear();
}

if ($("date")) {
    const today = new Date().toISOString().split("T")[0];
    $("date").min = today;
    $("date").value = today;
}

// =====================================================
// CORE PRICING LOGIC (Updated Travel Rule)
// =====================================================
function calculatePrice(rate, workers, hours, km) {
    workers = Math.max(1, Number(workers) || 1);
    hours = Math.max(1, Number(hours) || 1);
    km = Math.max(0, Number(km) || 0);
    rate = Number(rate) || 200;

    const work = rate * workers * hours;
    
    // Free if <= 3 km, full distance charged if > 3 km
    const fuel = km > CONFIG.freeKm ? km * CONFIG.feePerKm : 0;

    return {
        rate,
        workers,
        hours,
        km,
        work,
        fuel,
        total: work + fuel
    };
}

// =====================================================
// BIDIRECTIONAL SYNC & RENDERING
// =====================================================
let isUpdating = false;

function updateAll(source) {
    if (isUpdating) return;
    isUpdating = true;

    if (source === "quick") {
        $("ctype").value = $("qType").value;
        $("workers").value = $("qWorkers").value;
        $("hours").value = $("qHours").value;
        $("km").value = $("qKm").value;
    } else if (source === "main") {
        $("qType").value = $("ctype").value;
        $("qWorkers").value = $("workers").value;
        $("qHours").value = $("hours").value;
        $("qKm").value = $("km").value;
        $("qPreset").value = "custom";
    }

    const c = calculatePrice(
        $("ctype").value,
        $("workers").value,
        $("hours").value,
        $("km").value
    );

    // Update Quick Hero Panel
    if ($("qOut")) $("qOut").textContent = money(c.total);

    // Update Main Booking Sticky Panel
    if ($("lblWork")) $("lblWork").textContent = `${c.workers} staff × ${c.hours} hr × Rs ${c.rate}`;
    if ($("outWork")) $("outWork").textContent = money(c.work);

    if ($("lblFuel")) {
        $("lblFuel").textContent = c.fuel > 0
            ? `Transit: ${c.km} km × Rs ${CONFIG.feePerKm}`
            : `Transit (Within ${CONFIG.freeKm} km)`;
    }

    if ($("outFuel")) $("outFuel").textContent = c.fuel ? money(c.fuel) : "Free";
    if ($("outTotal")) $("outTotal").textContent = money(c.total);

    isUpdating = false;
}

// Preset Handler
if ($("qPreset")) {
    $("qPreset").addEventListener("change", (e) => {
        const val = e.target.value;
        if (CONFIG.presets[val]) {
            $("qWorkers").value = CONFIG.presets[val].workers;
            $("qHours").value = CONFIG.presets[val].hours;
        }
        updateAll("quick");
    });
}

// Attach Quick Inputs
["qType", "qWorkers", "qHours", "qKm"].forEach((id) => {
    const el = $(id);
    if (el) {
        el.addEventListener("input", () => {
            if (id === "qWorkers" || id === "qHours") {
                $("qPreset").value = "custom";
            }
            updateAll("quick");
        });
    }
});

// Attach Main Inputs
["ctype", "workers", "hours", "km"].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener("input", () => updateAll("main"));
});

// Initial compute
updateAll("quick");

// =====================================================
// FORM SUBMISSION -> WHATSAPP
// =====================================================
const bookForm = $("bookForm");

if (bookForm) {
    bookForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const err = $("formError");
        
        ["name", "phone", "address", "date"].forEach((id) => {
            if ($(id)) $(id).classList.remove("invalid");
        });

        const name = $("name").value.trim();
        const phone = $("phone").value.replace(/\D/g, "");
        const address = $("address").value.trim();
        const date = $("date").value;
        const bad = [];

        if (name.length < 2) bad.push("name");
        if (phone.length < 10) bad.push("phone");
        if (address.length < 5) bad.push("address");
        if (!date) bad.push("date");

        if (bad.length) {
            bad.forEach((id) => $(id).classList.add("invalid"));
            err.textContent = "Please fill in your name, 10-digit phone, clean site address and date.";
            $(bad[0]).focus();
            return;
        }

        err.textContent = "";

        const c = calculatePrice(
            $("ctype").value,
            $("workers").value,
            $("hours").value,
            $("km").value
        );

        const type = $("ctype").selectedOptions[0].text.split(" (")[0];

        const lines = [
            "*NEW BOOKING REQUEST - CLEAN X*",
            "--------------------------------",
            `👤 *Customer:* ${name}`,
            `📞 *Phone:* ${phone}`,
            `🏢 *Premises:* ${$("place").value}`,
            `🧼 *Type:* ${type}`,
            `👥 *Crew:* ${c.workers} workers | ${c.hours} hours`,
            `📍 *Distance:* ${c.km} km`,
            `📅 *Date:* ${date} at ${$("time").value}`,
            `🏠 *Address:* ${address}`,
            $("notes").value.trim() ? `📝 *Notes:* ${$("notes").value.trim()}` : null,
            "--------------------------------",
            `*Cleaning Cost:* ${money(c.work)}`,
            `*Transit Fee:* ${c.fuel ? money(c.fuel) : "Free"}`,
            `💰 *Estimated Total:* ${money(c.total)}`
        ].filter(Boolean);

        const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
        window.open(url, "_blank", "noopener");
    });
}

// =====================================================
// WORK GALLERY MODAL
// =====================================================
const modal = $("galleryModal");
const openBtns = [ $("openGalleryBtn"), $("heroGalleryBtn") ];
const closeBtn = $("closeGalleryBtn");

openBtns.forEach(btn => {
    if (btn) btn.addEventListener("click", () => modal.classList.add("open"));
});

if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("open");
    });
}

// =====================================================
// SCROLL PROGRESS, TO-TOP & INTERSECTION OBSERVER
// =====================================================
const bar = $("progress");
const toTop = $("toTop");

window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrollHeight = h.scrollHeight - h.clientHeight;
    const progress = scrollHeight > 0 ? (h.scrollTop / scrollHeight) * 100 : 0;

    if (bar) bar.style.width = progress + "%";
    if (toTop) toTop.classList.toggle("show", h.scrollTop > 600);
}, { passive: true });

if (toTop) {
    toTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add("in");
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
} else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
}

// Spotlight Card Hover Effect
document.querySelectorAll(".spot").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
});

// =====================================================
// FLOATING BUBBLES (ENERGY-SAVING)
// =====================================================
const cv = $("bubbles");
const heroSection = $("heroSection");

if (cv && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = cv.getContext("2d");
    let W, H, bubbles = [], isHeroVisible = true, animFrameId;

    const resize = () => {
        W = cv.width = cv.offsetWidth;
        H = cv.height = cv.offsetHeight;
    };

    const make = (initial) => ({
        x: Math.random() * W,
        y: initial ? Math.random() * H : H + 20,
        r: 4 + Math.random() * 20,
        s: 0.3 + Math.random() * 0.8,
        w: Math.random() * Math.PI * 2
    });

    resize();
    bubbles = Array.from({ length: Math.min(35, Math.round(W / 32)) }, () => make(true));
    window.addEventListener("resize", resize);

    function draw() {
        if (!isHeroVisible) return;
        ctx.clearRect(0, 0, W, H);

        bubbles.forEach((b, i) => {
            b.y -= b.s;
            b.w += 0.02;
            b.x += Math.sin(b.w) * 0.35;

            if (b.y < -30) bubbles[i] = make(false);

            const g = ctx.createRadialGradient(b.x - b.r * .3, b.y - b.r * .3, b.r * .1, b.x, b.y, b.r);
            g.addColorStop(0, "rgba(255,255,255,.5)");
            g.addColorStop(1, "rgba(34,211,238,.06)");

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,.3)";
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        animFrameId = requestAnimationFrame(draw);
    }

    if ("IntersectionObserver" in window && heroSection) {
        new IntersectionObserver(([entry]) => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible) {
                cancelAnimationFrame(animFrameId);
                draw();
            }
        }).observe(heroSection);
    } else {
        draw();
    }
}