const PAGE_SIZE = 5;

const REQUIRED_FILTERS = [
    {
        "fieldName": "animalStatus",
        "operation": "equals",
        "criteria": "Available"
    },
    {
        "fieldName": "animalSpecies",
        "operation": "equals",
        "criteria": "cat"
    },
    {
        "fieldName": "animalOrgID",
        "operation": "equals",
        "criteria": SHELTER_ID
    }
];

let _searchFilters = [];
getSearchData(1, REQUIRED_FILTERS);

let form = document.getElementById('search-form');
form.addEventListener('submit', submitForm)

function submitForm(e) {
    e.preventDefault();
    const formData = new FormData(form);
    filter = [];
    for (const [name, value] of formData) {
        if (value) {
            filter.push({
                "fieldName": name,
                "operation": "equals",
                "criteria": value
            })
        }
    }
    _searchFilters = filter;
    getSearchData(1, REQUIRED_FILTERS.concat(filter))
}

function page(evt) {
    let pageNumber = Number(evt.currentTarget?.innerText || 1);
    getSearchData(pageNumber, REQUIRED_FILTERS.concat(_searchFilters));
}

function sortByName(a, b) {
    const nameA = a.animalName.toUpperCase(); 
    const nameB = b.animalName.toUpperCase(); 
    if (nameA === nameB) {
        return 0;
    }
    return nameA > nameB ? 1 : -1;
}

function getSearchData(pageNumber, filters) {
    //let pageNumber = Number(evt.currentTarget?.innerText || 1);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.rescuegroups.org/http/v2.json");
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    let request = 
        {
            "apikey": API_KEY,
            "objectType": "animals",
            "objectAction": "publicSearch",
            "search": {
                "calcFoundRows": "Yes",
                "resultStart": (pageNumber - 1) * PAGE_SIZE,
                "resultLimit": PAGE_SIZE,
                "resultSort": "animalName",
                "fields": [
                    "animalName",
                    "animalSpecies", 
                    "animalSex", 
                    "animalGeneralAge", 
                    "animalDescription",
                    "animalThumbnailUrl"
                ],
                "filters": filters
            }
        };
        const body = JSON.stringify(request);
    xhr.onload = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            let response = JSON.parse(xhr.responseText);
            let numResults = response?.foundRows || 0;
            createPagers(numResults, pageNumber);
            let cats = Object.values(response?.data).sort(sortByName);
            createTable(cats);
        }
    };
    xhr.send(body);
}

function createPagers(numResults, currentPageNumber) {
    removePagers();
    if (numResults > PAGE_SIZE) {
        let numPages = Math.ceil(numResults / PAGE_SIZE);
        let pagerElements = document.getElementsByClassName('result-pager');
        for (let i = 0; i < pagerElements.length; i++) {
            for (let j = 0; j < numPages; j++) {
                let pageNumber = j + 1;
                // current page is not a button
                if (pageNumber == currentPageNumber) {
                    pagerElements[i].appendChild(createSpan(pageNumber.toString(), `page-${pageNumber}`));
                }
                // other pages are clickable
                else {
                    pagerElements[i].appendChild(createButton(pageNumber.toString(), `page-${pageNumber}`, page));
                }
            }
        }
    }
}

function removePagers() {
    let pagerElements = document.getElementsByClassName('result-pager');
    for (const pagerElement of pagerElements) {
        pagerElement.replaceChildren();
    }
}

function createTable(cats) {
    let container = document.getElementById('cat-container');
    container.replaceChildren();
    for (let i = 0; i < cats.length; i++) {
        container.appendChild(createCatResult(cats[i]));
    }
}

function createCatResult(cat) {
    let newDiv = document.createElement('div');
    newDiv.classList.add("cat-result");
    newDiv.appendChild(createCatText(cat));
    newDiv.appendChild(createCatImage(cat));
    return newDiv;
}

function createCatImage(cat) {
    let newImg = document.createElement('img');
    newImg.src = cat.animalThumbnailUrl;
    newImg.classList.add("cat-image");
    return newImg;
}

function createCatText(cat) {
    let newDiv = document.createElement('div');
    newDiv.classList.add('cat-text');
    newDiv.appendChild(createSpan(cat.animalName, "cat-name"));
    newDiv.appendChild(createSpan(`${cat.animalGeneralAge} `, "cat-age"));
    newDiv.appendChild(createSpan(cat.animalSex, "cat-sex"));
    return newDiv;
}

function createSpan(text, className) {
    let newSpan = document.createElement('span');
    newSpan.classList.add(className);
    newSpan.textContent = text;
    return newSpan;
}

function createButton(text, className, onClickFn) {
    let newButton = document.createElement('button');
    newButton.textContent = text;
    newButton.classList.add(className);
    newButton.addEventListener('click', onClickFn);
    return newButton;
}


