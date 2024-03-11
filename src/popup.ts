import $ from 'jquery';

$('.oauth.github').on('click', async () => {
    const data = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ msg: 'LOGIN_GITHUB' }, response => {
            resolve(response);
        })
    });
});