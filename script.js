// =====================================================
// CLEAN X SETTINGS
// =====================================================

const CONFIG = {

    // CLEAN X WhatsApp number
    whatsapp: "919656320458",

    // Free travel distance
    freeKm: 3,

    // Travel charge beyond free distance
    feePerKm: 50

};


// =====================================================
// HELPER FUNCTIONS
// =====================================================

const $ = (id) => document.getElementById(id);


const money = (n) => {

    return "Rs " + Number(n).toLocaleString("en-IN");

};


// =====================================================
// MOBILE MENU
// =====================================================

const menu = $("menu");
const menuBtn = $("menuBtn");


if (menu && menuBtn) {

    menuBtn.addEventListener("click", () => {

        const open =
            menu.classList.toggle("open");

        menuBtn.setAttribute(
            "aria-expanded",
            open
        );

    });


    menu.addEventListener("click", (e) => {

        if (e.target.tagName === "A") {

            menu.classList.remove("open");

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


// =====================================================
// YEAR
// =====================================================

if ($("year")) {

    $("year").textContent =
        new Date().getFullYear();

}


// =====================================================
// DATE
// =====================================================

if ($("date")) {

    const today =
        new Date().toISOString().split("T")[0];

    $("date").min = today;

    $("date").value = today;

}


// =====================================================
// PRICE CALCULATOR
// =====================================================

function price(rate, workers, hours, km) {

    workers =
        Math.max(
            1,
            Number(workers) || 1
        );


    hours =
        Math.max(
            1,
            Number(hours) || 1
        );


    km =
        Math.max(
            0,
            Number(km) || 0
        );


    rate =
        Number(rate) || 0;


    const work =
        rate *
        workers *
        hours;


    const extraKm =
        Math.max(
            0,
            km - CONFIG.freeKm
        );


    const fuel =
        extraKm *
        CONFIG.feePerKm;


    return {

        rate,

        workers,

        hours,

        km,

        work,

        extraKm,

        fuel,

        total:
            work + fuel

    };

}


// =====================================================
// MAIN CALCULATOR
// =====================================================

function calc() {

    return price(

        $("ctype").value,

        $("workers").value,

        $("hours").value,

        $("km").value

    );

}


// =====================================================
// RENDER ESTIMATE
// =====================================================

function render() {

    const c = calc();


    if ($("lblWork")) {

        $("lblWork").textContent =
            `${c.workers} worker(s) × ${c.hours} hr × Rs ${c.rate}`;

    }


    if ($("outWork")) {

        $("outWork").textContent =
            money(c.work);

    }


    if ($("lblFuel")) {

        $("lblFuel").textContent =
            c.extraKm > 0

                ? `Travel: ${c.extraKm} km beyond ${CONFIG.freeKm} km × Rs ${CONFIG.feePerKm}`

                : `Travel (within ${CONFIG.freeKm} km)`;

    }


    if ($("outFuel")) {

        $("outFuel").textContent =
            c.fuel
                ? money(c.fuel)
                : "Free";

    }


    if ($("outTotal")) {

        $("outTotal").textContent =
            money(c.total);

    }

}


// =====================================================
// BOOKING CALCULATOR INPUTS
// =====================================================

[
    "ctype",
    "workers",
    "hours",
    "km"
].forEach((id) => {

    const element = $(id);

    if (element) {

        element.addEventListener(
            "input",
            render
        );

    }

});


render();


// =====================================================
// QUICK HERO PRICE CALCULATOR
// =====================================================

function renderQuick() {

    const c = price(

        $("qType").value,

        $("qWorkers").value,

        $("qHours").value,

        $("qKm").value

    );


    $("qOut").textContent =
        money(c.total);


    // Copy quick calculator values
    // into booking calculator

    $("ctype").value =
        $("qType").value;

    $("workers").value =
        $("qWorkers").value;

    $("hours").value =
        $("qHours").value;

    $("km").value =
        $("qKm").value;


    render();

}


[
    "qType",
    "qWorkers",
    "qHours",
    "qKm"
].forEach((id) => {

    const element = $(id);

    if (element) {

        element.addEventListener(
            "input",
            renderQuick
        );

    }

});


renderQuick();


// =====================================================
// BOOKING -> WHATSAPP
// =====================================================

const bookForm = $("bookForm");


if (bookForm) {

    bookForm.addEventListener(
        "submit",
        (e) => {

            e.preventDefault();


            const err =
                $("formError");


            // Remove previous errors

            [
                "name",
                "phone",
                "address",
                "date"
            ].forEach((id) => {

                $(id).classList.remove(
                    "invalid"
                );

            });


            // Get values

            const name =
                $("name").value.trim();


            const phone =
                $("phone")
                    .value
                    .replace(/\D/g, "");


            const address =
                $("address").value.trim();


            const date =
                $("date").value;


            const bad = [];


            // Validation

            if (name.length < 2) {

                bad.push("name");

            }


            if (phone.length < 10) {

                bad.push("phone");

            }


            if (address.length < 5) {

                bad.push("address");

            }


            if (!date) {

                bad.push("date");

            }


            // Show error

            if (bad.length) {

                bad.forEach((id) => {

                    $(id).classList.add(
                        "invalid"
                    );

                });


                err.textContent =
                    "Please fill in your name, a 10-digit phone number, address and date.";


                $(bad[0]).focus();

                return;

            }


            err.textContent = "";


            // Calculate price

            const c = calc();


            const type =
                $("ctype")
                    .selectedOptions[0]
                    .text
                    .split(" (")[0];


            // WhatsApp message

            const lines = [

                "*New booking - CLEAN X*",

                "",

                `Name: ${name}`,

                `Phone: ${phone}`,

                `Place: ${$("place").value}`,

                `Cleaning: ${type}`,

                `Workers: ${c.workers} | Hours: ${c.hours}`,

                `Distance: ${c.km} km`,

                `Date: ${date}`,

                `Time: ${$("time").value}`,

                `Address: ${address}`,

                $("notes").value.trim()

                    ? `Notes: ${$("notes").value.trim()}`

                    : null,

                "",

                `Cleaning cost: ${money(c.work)}`,

                `Travel charge: ${
                    c.fuel
                        ? money(c.fuel)
                        : "Free"
                }`,

                `*Estimated total: ${money(c.total)}*`

            ].filter(
                (line) => line !== null
            );


            // Create WhatsApp URL

            const url =
                `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
                    lines.join("\n")
                )}`;


            // Open WhatsApp

            window.open(
                url,
                "_blank",
                "noopener"
            );

        }
    );

}


// =====================================================
// REDUCED MOTION
// =====================================================

const reduced =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


// =====================================================
// SCROLL PROGRESS + BACK TO TOP
// =====================================================

const bar =
    $("progress");

const toTop =
    $("toTop");


window.addEventListener(
    "scroll",
    () => {

        const h =
            document.documentElement;


        const scrollHeight =
            h.scrollHeight -
            h.clientHeight;


        const progress =
            scrollHeight > 0

                ? (
                    h.scrollTop /
                    scrollHeight
                ) * 100

                : 0;


        if (bar) {

            bar.style.width =
                progress + "%";

        }


        if (toTop) {

            toTop.classList.toggle(
                "show",
                h.scrollTop > 600
            );

        }

    },
    {
        passive: true
    }
);


if (toTop) {

    toTop.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


// =====================================================
// REVEAL ON SCROLL
// =====================================================

if ("IntersectionObserver" in window) {

    const io =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((en) => {

                    if (
                        en.isIntersecting
                    ) {

                        en.target.classList.add(
                            "in"
                        );

                        io.unobserve(
                            en.target
                        );

                    }

                });

            },
            {
                threshold: 0.15
            }
        );


    document
        .querySelectorAll(".reveal")
        .forEach((el) => {

            io.observe(el);

        });

} else {

    document
        .querySelectorAll(".reveal")
        .forEach((el) => {

            el.classList.add("in");

        });

}


// =====================================================
// BEFORE / AFTER SLIDER
// =====================================================

const ba =
    $("ba");

const range =
    $("baRange");


if (ba && range) {

    range.addEventListener(
        "input",
        () => {

            ba.style.setProperty(
                "--p",
                range.value + "%"
            );

        }
    );

}


// =====================================================
// MOUSE SPOTLIGHT
// =====================================================

document
    .querySelectorAll(".spot")
    .forEach((el) => {

        el.addEventListener(
            "mousemove",
            (e) => {

                const r =
                    el.getBoundingClientRect();


                el.style.setProperty(
                    "--mx",
                    e.clientX -
                    r.left +
                    "px"
                );


                el.style.setProperty(
                    "--my",
                    e.clientY -
                    r.top +
                    "px"
                );

            }
        );

    });


// =====================================================
// FLOATING BUBBLES
// =====================================================

const cv =
    $("bubbles");


if (
    cv &&
    !reduced
) {

    const ctx =
        cv.getContext("2d");


    let W;
    let H;

    let bubbles = [];


    // Resize canvas

    const resize = () => {

        W =
            cv.width =
            cv.offsetWidth;


        H =
            cv.height =
            cv.offsetHeight;

    };


    // Create bubble

    const make = (initial) => ({

        x:
            Math.random() * W,

        y:
            initial

                ? Math.random() * H

                : H + 20,

        r:
            4 +
            Math.random() * 22,

        s:
            .3 +
            Math.random() * .9,

        w:
            Math.random() *
            Math.PI *
            2

    });


    resize();


    bubbles =
        Array.from(

            {
                length:
                    Math.min(
                        45,
                        Math.round(
                            W / 28
                        )
                    )
            },

            () => make(true)

        );


    window.addEventListener(
        "resize",
        resize
    );


    // Draw bubbles

    (function draw() {

        ctx.clearRect(
            0,
            0,
            W,
            H
        );


        bubbles.forEach(
            (b, i) => {

                b.y -= b.s;

                b.w += 0.02;

                b.x +=
                    Math.sin(b.w) *
                    0.4;


                if (
                    b.y < -30
                ) {

                    bubbles[i] =
                        make(false);

                }


                const g =
                    ctx.createRadialGradient(

                        b.x -
                        b.r * .3,

                        b.y -
                        b.r * .3,

                        b.r * .1,

                        b.x,

                        b.y,

                        b.r

                    );


                g.addColorStop(
                    0,
                    "rgba(255,255,255,.55)"
                );


                g.addColorStop(
                    1,
                    "rgba(34,211,238,.08)"
                );


                ctx.beginPath();


                ctx.arc(
                    b.x,
                    b.y,
                    b.r,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle = g;

                ctx.fill();


                ctx.strokeStyle =
                    "rgba(255,255,255,.35)";

                ctx.lineWidth = 1;

                ctx.stroke();

            }
        );


        requestAnimationFrame(draw);

    })();

}