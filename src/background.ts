const SERVER_URL='http://localhost:8080';
const MAX_FAVORITE_LANGUAGE = 3;

type GithubTokenResponse = { access_token: string, scope: string, token_type: string };

async function getGithubInfo() {
    return fetch(SERVER_URL+'/api/v1/extra/github')
    .then(response => {
        if (!response.ok) throw new Error('__MSG_check_network__');

        return response.json();
    })
    .then(json => {
        if (!json.success) 
            throw new Error(`status: ${json.error.status}\n${json.error.message}`);

        return json.response;
    })
    .catch(error => {
        console.error(error);
    })
}

function getCodeFromUrl(url: string) : string {
    const matches = url.match(/code=([^&]*)/);

    if (matches && matches[1]) {
        return matches[1];
    } else {
        return '';
    }
}

async function loginGithub(_callback: (response: any) => void) {
    const info = await getGithubInfo();

    chrome.identity.launchWebAuthFlow( {'url': `https://github.com/login/oauth/authorize?client_id=${info.clientId}&scope=user%20repo`, 'interactive': true}, redirectUrl => {
        if (!redirectUrl) return;

        const code = getCodeFromUrl(redirectUrl);
        if (!code) return;

        fetch(SERVER_URL+'/api/v1/oauth/github', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('__MSG_check_network__');

            return response.json();
        })
        .then(json => {
            if (!json.success)
                throw new Error(`status: ${json.error.status}\n${json.error.message}`);
            
            const response = json.response;

            chrome.storage.local.set({
                github: {
                    ...response
                }
            });

            _callback({ success: true, data: response });
        })
        .catch(error => {
            _callback({ success: false, data: error });
            console.error(error);
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.msg) {
        case 'LOGIN_GITHUB':
            loginGithub((response): void => {
                sendResponse(response);
            });
            return true;
        case 'USER_INFO':
            chrome.storage.local.get('github').then( response => {
                sendResponse(response.github);
            });
            return true;
        case 'ADD_FAVORITE_LANGUAGE':
            const selectedLanguage = request.data;
            chrome.storage.local.get('favorite_language').then( data => {
                const favoriteLanguages = data.favorite_language;

                if (Object.keys(favoriteLanguages).length >= MAX_FAVORITE_LANGUAGE) {
                    sendResponse(Object.keys(favoriteLanguages));
                    return true;
                }

                favoriteLanguages[selectedLanguage] = true;

                chrome.storage.local.set({ favorite_language: favoriteLanguages });
                sendResponse(Object.keys(favoriteLanguages));
            });
            return true;
        case 'REMOVE_FAVORITE_LANGUAGE':
            const removeLanguage = request.data;
            chrome.storage.local.get('favorite_language').then( data => {
                const favoriteLanguages = data.favorite_language;

                delete favoriteLanguages[removeLanguage];

                chrome.storage.local.set({ favorite_language: favoriteLanguages });
                sendResponse(Object.keys(favoriteLanguages));
            });
            return true;
        case 'GET_FAVORITE_LANGUAGE':
            chrome.storage.local.get('favorite_language').then( response => {
                sendResponse(Object.keys(response.favorite_language));
            });
            return true;
        default:
            break;
    }
});