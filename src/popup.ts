import $ from 'jquery';

const $loading = $('.loading');

function showTag($tag: JQuery<HTMLElement>) {
    $tag.removeClass('hide');
}

function hideTag($tag: JQuery<HTMLElement>) {
    $tag.addClass('hide');
}

$('.oauth.github').on('click', async () => {
    showTag($loading);
    const data = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ msg: 'LOGIN_GITHUB' }, response => {
            resolve(response);
        })
    });
    hideTag($loading);
});