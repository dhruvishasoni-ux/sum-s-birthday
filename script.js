// =========================================
// SKY
// =========================================

const sky =
    document.getElementById("sky");

const space =
    document.getElementById("space");


// =========================================
// CREATE STARS
// =========================================

for (let i = 0; i < 600; i++) {

    const star =
        document.createElement("div");

    star.className =
        "star";


    const size =
        Math.random() * 2.5 + 1;


    star.style.width =
        size + "px";


    star.style.height =
        size + "px";


    star.style.left =
        Math.random() * 100 + "%";


    star.style.top =
        Math.random() * 100 + "%";


    star.style.opacity =
        Math.random() * 0.5 + 0.2;


    if (Math.random() < 0.15) {

        star.classList.add(
            "twinkle"
        );

        star.style.animationDelay =
            Math.random() * 3 + "s";

    }


    if (Math.random() < 0.05) {

        star.classList.add(
            "bright-star"
        );


        if (Math.random() < 0.3) {

            star.classList.add(
                "special-star"
            );

        }

    }


    space.appendChild(
        star
    );

}


// =========================================
// SKY MOVEMENT
// =========================================

let draggingSky = false;

let startX = 0;
let startY = 0;

let offsetX = 0;
let offsetY = 0;

let zoom = 1;


function updateSpace() {

    space.style.transform =
        `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;

}


sky.addEventListener(
    "mousedown",
    function(event) {

        if (
            event.target.closest("button") ||
            event.target.closest("input") ||
            event.target.closest("textarea") ||
            event.target.closest("select") ||
            event.target.closest(".wish-window")
        ) {

            return;

        }


        draggingSky =
            true;


        startX =
            event.clientX -
            offsetX;


        startY =
            event.clientY -
            offsetY;

    }
);


document.addEventListener(
    "mousemove",
    function(event) {

        if (!draggingSky) {

            return;

        }


        offsetX =
            event.clientX -
            startX;


        offsetY =
            event.clientY -
            startY;


        updateSpace();

    }
);


document.addEventListener(
    "mouseup",
    function() {

        draggingSky =
            false;

    }
);


// =========================================
// ZOOM
// =========================================

sky.addEventListener(
    "wheel",
    function(event) {

        if (
            event.target.closest(".wish-window")
        ) {

            return;

        }


        event.preventDefault();


        if (event.deltaY < 0) {

            zoom += 0.1;

        } else {

            zoom -= 0.1;

        }


        zoom =
            Math.max(
                0.5,
                Math.min(
                    2.5,
                    zoom
                )
            );


        updateSpace();

    },
    {
        passive: false
    }
);


// =========================================
// SHOOTING STARS
// =========================================

function createShootingStar() {

    const shootingStar =
        document.createElement("div");


    shootingStar.className =
        "shooting-star";


    shootingStar.style.left =
        Math.random() * 100 + "%";


    shootingStar.style.top =
        Math.random() * 50 + "%";


    space.appendChild(
        shootingStar
    );


    setTimeout(
        function() {

            shootingStar.remove();

        },
        1500
    );

}


setInterval(
    createShootingStar,
    8000
);


// =========================================
// STATISTICS
// =========================================

let wishes = 0;

let constellations = 0;

let friends = 0;

let unopened = 0;


function updateStatistics() {

    document.getElementById(
        "wishCount"
    ).textContent =
        wishes;


    document.getElementById(
        "constellationCount"
    ).textContent =
        constellations;


    document.getElementById(
        "friendCount"
    ).textContent =
        friends;


    document.getElementById(
        "unopenedCount"
    ).textContent =
        unopened;

}


updateStatistics();


// =========================================
// WISH STUDIO
// =========================================

const wishStudio =
    document.getElementById(
        "wishStudio"
    );


const addWish =
    document.getElementById(
        "addWish"
    );


const closeWish =
    document.getElementById(
        "closeWishStudio"
    );


addWish.addEventListener(
    "click",
    function() {

        wishStudio.classList.remove(
            "hidden"
        );

    }
);


closeWish.addEventListener(
    "click",
    function() {

        wishStudio.classList.add(
            "hidden"
        );

        deselectSticker();

    }
);


// =========================================
// CARD TEXT
// =========================================

const wishTitle =
    document.getElementById(
        "wishTitle"
    );


const wishBody =
    document.getElementById(
        "wishBody"
    );


const wishFrom =
    document.getElementById(
        "wishFrom"
    );


const previewTitle =
    document.getElementById(
        "previewTitle"
    );


const previewBody =
    document.getElementById(
        "previewBody"
    );


const previewFrom =
    document.getElementById(
        "previewFrom"
    );


wishTitle.addEventListener(
    "input",
    function() {

        previewTitle.textContent =
            wishTitle.value.trim() ||
            "Happy Birthday! ✨";

    }
);


wishBody.addEventListener(
    "input",
    function() {

        previewBody.textContent =
            wishBody.value.trim() ||
            "Your beautiful birthday message will appear here...";

    }
);


wishFrom.addEventListener(
    "input",
    function() {

        previewFrom.textContent =
            wishFrom.value.trim() ||
            "— Your bestie ♡";

    }
);


// =========================================
// FONTS
// =========================================

const titleFont =
    document.getElementById(
        "titleFont"
    );


const bodyFont =
    document.getElementById(
        "bodyFont"
    );


const fromFont =
    document.getElementById(
        "fromFont"
    );


const titleSize =
    document.getElementById(
        "titleSize"
    );


const bodySize =
    document.getElementById(
        "bodySize"
    );


const fromSize =
    document.getElementById(
        "fromSize"
    );


const fontClasses = [
    "font-elegant",
    "font-modern",
    "font-playful",
    "font-handwritten",
    "font-cursive",
    "font-typewriter"
];


function applyFont(
    element,
    selectedFont
) {

    fontClasses.forEach(
        function(className) {

            element.classList.remove(
                className
            );

        }
    );


    element.classList.add(
        "font-" + selectedFont
    );

}


titleFont.addEventListener(
    "change",
    function() {

        applyFont(
            previewTitle,
            titleFont.value
        );

    }
);


bodyFont.addEventListener(
    "change",
    function() {

        applyFont(
            previewBody,
            bodyFont.value
        );

    }
);


fromFont.addEventListener(
    "change",
    function() {

        applyFont(
            previewFrom,
            fromFont.value
        );

    }
);


titleSize.addEventListener(
    "input",
    function() {

        previewTitle.style.fontSize =
            titleSize.value + "px";

    }
);


bodySize.addEventListener(
    "input",
    function() {

        previewBody.style.fontSize =
            bodySize.value + "px";

    }
);


fromSize.addEventListener(
    "input",
    function() {

        previewFrom.style.fontSize =
            fromSize.value + "px";

    }
);


// =========================================
// THEME + BACKGROUND
// =========================================

const wishPreview =
    document.getElementById(
        "wishPreview"
    );


const backgroundTexture =
    document.getElementById(
        "backgroundTexture"
    );


const themeButtons =
    document.querySelectorAll(
        ".theme-option"
    );


const backgroundButtons =
    document.querySelectorAll(
        ".background-option"
    );


let selectedTheme =
    "midnight";


let selectedBackground =
    "plain";


function updatePreviewClasses() {

    wishPreview.className =
        `wish-preview theme-${selectedTheme} background-${selectedBackground}`;

}


themeButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {


                themeButtons.forEach(
                    function(other) {

                        other.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                selectedTheme =
                    button.dataset.theme;


                updatePreviewClasses();

            }
        );

    }
);


backgroundButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {


                backgroundButtons.forEach(
                    function(other) {

                        other.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                selectedBackground =
                    button.dataset.background;


                updatePreviewClasses();

            }
        );

    }
);


// =========================================
// COLORS
// =========================================

const colorSwatches =
    document.querySelectorAll(
        ".color-swatch"
    );


const customColor =
    document.getElementById(
        "customColor"
    );


function setAccent(
    color
) {

    wishPreview.style.setProperty(
        "--accent",
        color
    );


    colorSwatches.forEach(
        function(swatch) {

            swatch.classList.remove(
                "active"
            );

        }
    );

}


colorSwatches.forEach(
    function(swatch) {

        swatch.addEventListener(
            "click",
            function() {

                const color =
                    swatch.dataset.color;


                setAccent(
                    color
                );


                swatch.classList.add(
                    "active"
                );


                customColor.value =
                    color;

            }
        );

    }
);


customColor.addEventListener(
    "input",
    function() {

        setAccent(
            customColor.value
        );

    }
);


// =========================================
// STICKER CATEGORIES
// =========================================

const stickerTabs =
    document.querySelectorAll(
        ".sticker-tab"
    );


const stickerButtons =
    document.querySelectorAll(
        ".sticker-button"
    );


stickerTabs.forEach(
    function(tab) {

        tab.addEventListener(
            "click",
            function() {


                stickerTabs.forEach(
                    function(other) {

                        other.classList.remove(
                            "active"
                        );

                    }
                );


                tab.classList.add(
                    "active"
                );


                const category =
                    tab.dataset.category;


                stickerButtons.forEach(
                    function(button) {

                        if (
                            category === "all" ||
                            button.dataset.category === category
                        ) {

                            button.style.display =
                                "block";

                        } else {

                            button.style.display =
                                "none";

                        }

                    }
                );

            }
        );

    }
);


// =========================================
// STICKERS
// =========================================

let selectedSticker = null;


const stickerToolbar =
    document.getElementById(
        "stickerToolbar"
    );


let stickerCounter = 0;


function addCardSticker(
    content,
    size,
    x = null,
    y = null,
    rotation = 0
) {


    const sticker =
        document.createElement("div");


    sticker.className =
        "card-sticker";


    sticker.textContent =
        content;


    sticker.dataset.id =
        ++stickerCounter;


    sticker.dataset.size =
        size;


    sticker.dataset.rotation =
        rotation;


    sticker.style.fontSize =
        size + "px";


    sticker.style.transform =
        `translate(-50%, -50%) rotate(${rotation}deg)`;


    if (
        x === null ||
        y === null
    ) {

        x =
            wishPreview.clientWidth *
            (0.2 + Math.random() * 0.6);


        y =
            wishPreview.clientHeight *
            (0.2 + Math.random() * 0.6);

    }


    sticker.style.left =
        x + "px";


    sticker.style.top =
        y + "px";


    wishPreview.appendChild(
        sticker
    );


    setupStickerDragging(
        sticker
    );


    selectSticker(
        sticker
    );

}


function setupStickerDragging(
    sticker
) {


    let dragging = false;


    let offsetX = 0;

    let offsetY = 0;


    sticker.addEventListener(
        "pointerdown",
        function(event) {


            event.preventDefault();

            event.stopPropagation();


            selectSticker(
                sticker
            );


            dragging = true;


            sticker.setPointerCapture(
                event.pointerId
            );


            const rect =
                sticker.getBoundingClientRect();


            offsetX =
                event.clientX -
                (
                    rect.left +
                    rect.width / 2
                );


            offsetY =
                event.clientY -
                (
                    rect.top +
                    rect.height / 2
                );

        }
    );


    sticker.addEventListener(
        "pointermove",
        function(event) {


            if (!dragging) {

                return;

            }


            const rect =
                wishPreview.getBoundingClientRect();


            const size =
                parseFloat(
                    sticker.dataset.size
                );


            const padding =
                size / 2;


            let x =
                event.clientX -
                rect.left -
                offsetX;


            let y =
                event.clientY -
                rect.top -
                offsetY;


            x =
                Math.max(
                    padding,
                    Math.min(
                        rect.width - padding,
                        x
                    )
                );


            y =
                Math.max(
                    padding,
                    Math.min(
                        rect.height - padding,
                        y
                    )
                );


            sticker.style.left =
                x + "px";


            sticker.style.top =
                y + "px";

        }
    );


    sticker.addEventListener(
        "pointerup",
        function(event) {

            dragging = false;


            try {

                sticker.releasePointerCapture(
                    event.pointerId
                );

            } catch (error) {

                // Already released.

            }

        }
    );


    sticker.addEventListener(
        "pointercancel",
        function(event) {

            dragging = false;


            try {

                sticker.releasePointerCapture(
                    event.pointerId
                );

            } catch (error) {

                // Already released.

            }

        }
    );

}


stickerButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const content =
                    button.dataset.sticker;


                const size =
                    button.dataset.big === "true"
                        ? 105
                        : 38;


                addCardSticker(
                    content,
                    size
                );

            }
        );

    }
);


// =========================================
// SELECT / DESELECT
// =========================================

function selectSticker(
    sticker
) {


    if (selectedSticker) {

        selectedSticker.classList.remove(
            "selected"
        );

    }


    selectedSticker =
        sticker;


    sticker.classList.add(
        "selected"
    );


    stickerToolbar.classList.remove(
        "hidden"
    );

}


function deselectSticker() {


    if (selectedSticker) {

        selectedSticker.classList.remove(
            "selected"
        );

    }


    selectedSticker =
        null;


    stickerToolbar.classList.add(
        "hidden"
    );

}


wishPreview.addEventListener(
    "pointerdown",
    function(event) {

        if (
            event.target === wishPreview ||
            event.target === backgroundTexture
        ) {

            deselectSticker();

        }

    }
);


// =========================================
// RESIZE
// =========================================

function resizeSelectedSticker(
    amount
) {


    if (!selectedSticker) {

        return;

    }


    let size =
        parseFloat(
            selectedSticker.dataset.size
        );


    size +=
        amount;


    size =
        Math.max(
            18,
            Math.min(
                220,
                size
            )
        );


    selectedSticker.dataset.size =
        size;


    selectedSticker.style.fontSize =
        size + "px";

}


document.getElementById(
    "makeSmaller"
).addEventListener(
    "click",
    function() {

        resizeSelectedSticker(-8);

    }
);


document.getElementById(
    "makeLarger"
).addEventListener(
    "click",
    function() {

        resizeSelectedSticker(8);

    }
);


// =========================================
// ROTATE
// =========================================

function rotateSelectedSticker(
    amount
) {


    if (!selectedSticker) {

        return;

    }


    let rotation =
        parseFloat(
            selectedSticker.dataset.rotation
        );


    rotation +=
        amount;


    selectedSticker.dataset.rotation =
        rotation;


    selectedSticker.style.transform =
        `translate(-50%, -50%) rotate(${rotation}deg)`;

}


document.getElementById(
    "rotateLeft"
).addEventListener(
    "click",
    function() {

        rotateSelectedSticker(-15);

    }
);


document.getElementById(
    "rotateRight"
).addEventListener(
    "click",
    function() {

        rotateSelectedSticker(15);

    }
);


// =========================================
// DELETE
// =========================================

document.getElementById(
    "deleteSticker"
).addEventListener(
    "click",
    function() {


        if (!selectedSticker) {

            return;

        }


        selectedSticker.remove();

        deselectSticker();

    }
);


// =========================================
// DUPLICATE
// =========================================

document.getElementById(
    "duplicateSticker"
).addEventListener(
    "click",
    function() {


        if (!selectedSticker) {

            return;

        }


        const old =
            selectedSticker;


        const x =
            parseFloat(
                old.style.left
            );


        const y =
            parseFloat(
                old.style.top
            );


        const size =
            parseFloat(
                old.dataset.size
            );


        const rotation =
            parseFloat(
                old.dataset.rotation
            );


        addCardSticker(
            old.textContent,
            size,
            Math.min(
                wishPreview.clientWidth -
                size / 2,
                x + 35
            ),
            Math.min(
                wishPreview.clientHeight -
                size / 2,
                y + 35
            ),
            rotation
        );

    }
);


// =========================================
// LAYERING
// =========================================

function changeLayer(
    amount
) {


    if (!selectedSticker) {

        return;

    }


    let z =
        parseInt(
            selectedSticker.style.zIndex ||
            20
        );


    z += amount;


    selectedSticker.style.zIndex =
        Math.max(
            5,
            Math.min(
                100,
                z
            )
        );

}


document.getElementById(
    "bringForward"
).addEventListener(
    "click",
    function() {

        changeLayer(1);

    }
);


document.getElementById(
    "sendBackward"
).addEventListener(
    "click",
    function() {

        changeLayer(-1);

    }
);


// =========================================
// UPLOAD CUSTOM STICKER
// =========================================

const uploadButton =
    document.getElementById(
        "uploadStickerButton"
    );


const uploadInput =
    document.getElementById(
        "stickerUpload"
    );


uploadButton.addEventListener(
    "click",
    function() {

        uploadInput.click();

    }
);


uploadInput.addEventListener(
    "change",
    function() {


        const file =
            uploadInput.files[0];


        if (!file) {

            return;

        }


        if (
            ![
                "image/png",
                "image/webp",
                "image/jpeg"
            ].includes(
                file.type
            )
        ) {

            alert(
                "Please choose a PNG, WebP or JPG image."
            );

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {


                const image =
                    document.createElement("img");


                image.className =
                    "card-sticker";


                image.src =
                    event.target.result;


                image.dataset.size =
                    100;


                image.dataset.rotation =
                    0;


                image.style.width =
                    "100px";


                image.style.height =
                    "100px";


                image.style.objectFit =
                    "contain";


                image.style.left =
                    wishPreview.clientWidth / 2 +
                    "px";


                image.style.top =
                    wishPreview.clientHeight / 2 +
                    "px";


                image.style.transform =
                    "translate(-50%, -50%)";


                image.style.zIndex =
                    20;


                wishPreview.appendChild(
                    image
                );


                setupStickerDragging(
                    image
                );


                selectSticker(
                    image
                );

            };


        reader.readAsDataURL(
            file
        );


        uploadInput.value =
            "";

    }
);


// =========================================
// CONTINUE
// =========================================

document.getElementById(
    "continueWish"
).addEventListener(
    "click",
    function() {

        const button =
            this;


        const original =
            button.innerHTML;


        button.innerHTML =
            "Ready for the stars ✦";


        button.disabled =
            true;


        setTimeout(
            function() {

                alert(
                    "The constellation creator is the next stage of your wish ✨"
                );


                button.innerHTML =
                    original;


                button.disabled =
                    false;

            },
            700
        );

    }
);