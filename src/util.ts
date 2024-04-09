/**
 * Jquery 요소에 'hide' 클래스를 제거해 표시되지 않도록 숨긴다.
 * @param $tag {JQuery<HTMLElement>}
 */
export function showTag($tag: JQuery<HTMLElement>) {
    $tag.removeClass('hide');
}

/**
 * Jquery 요소에 'hide' 클래스를 추가해 표시되지 않도록 숨긴다.
 * @param $tag {JQuery<HTMLElement>} 숨길 태그
 */
export function hideTag($tag: JQuery<HTMLElement>) {
    $tag.addClass('hide');
}

/**
 * html 파일에 대해서 현지화를 제공하기 위해 data-locale="${messages.json의 키}" 형식으로 드러날 텍스트를 지정 후 변환
 * ex.) ko: (greeting: "안녕"), en: (greeting: hello)라는 번역 정보와 <span data-locale="greeting"></span>라는 태그가 있다면 ko: <span data-locale="greeting">안녕</span> ,en: <span data-locale="greeting">hello</span>으로 변환.
 */
export function localization() {
    document.querySelectorAll('[data-locale]').forEach(elem => {
        if (elem instanceof HTMLElement && elem.dataset.locale)
            elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
    });
}

/**
 * 
 */
export function fetchLanguageSet() {
    return fetch('./languages.json')
        .then(res => res.json());
}


export function toFindRegExp(input: string): RegExp {
    input = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape special characters
        .split(/([\\\\]?.)/)
        .filter(Boolean) // remove empty strings
        .join('.*'); // append wildcards between characters

    return new RegExp('^'+input, 'i');
}
