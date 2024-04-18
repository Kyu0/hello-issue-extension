import { Octokit } from '@octokit/rest';
import $ from 'jquery';
import { showTag, hideTag, localization, fetchLanguageSet, toFindRegExp } from './util';

// TODO: Modularization
interface Authentication {
    accessToken: string,
    scope: string,
    tokenType: string
}

interface MessageResponse {
    success: boolean,
    data: any
}

interface UserProfile {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    hireable: boolean | null;
    bio: string | null;
    twitter_username?: string | null | undefined;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}

interface LanguageInfo {
    [key: string] : {
        color: string
    }
}

// popup.html의 접근이 필요한 태그들을 선언
const tags = {
    $loading: $('.loading'),
    $greeting: $('.greeting'),
    $login: $('.greeting').find('.oauth.github'),
    $profile: $('.profile'),
    profile: {
        $picture: $('.profile').find('.picture'),
        $username: $('.profile').find('.username'),
        $bio: $('.profile').find('.bio'),
        $repository: $('.profile').find('.repository')
    },
    languages: {
        $input: $('#language-input'),
        $favorite: $('#favorite-language-list'),
        $list: $('.language-list > ul'),
        list: {
            $container: $('.language-list')
        }
    }
};

let LANGUAGES: LanguageInfo;

localization();

function updatePage(profile: UserProfile) {
    hideTag(tags.$greeting);
    showTag(tags.$profile);

    tags.profile.$picture.attr('src', profile.avatar_url);
    tags.profile.$username.text(profile.login);
    if (profile.bio) tags.profile.$bio.text(profile.bio);
    tags.profile.$repository.attr('href', profile.repos_url);
}

tags.$login.on('click', async () => {
    showTag(tags.$loading);

    const response: MessageResponse = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ msg: 'LOGIN_GITHUB' }, response => {
            resolve(response);
        })
    });

    if (!response.success) return;

    const authentication: Authentication = response.data;
    const octokit = new Octokit({ auth: authentication.accessToken });

    octokit.request('GET /user', {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    }).then(response => {
        updatePage(response.data);
        hideTag(tags.$loading);
    });
});

function fetchRecommandKeys(recommandedKeys: string[]) {
    tags.languages.$list.empty();

    recommandedKeys.map(language => {
        const $option = $(`<li class="add-language" value="${language}"><span style="background-color: ${LANGUAGES[language]['color']};"></span>${language}</li>`);
        $option.on('click', (event) => {
            tags.languages.$input.val('').trigger('input');
            tags.languages.list.$container.addClass('hide');

            const selectedLanguage = event.target.getAttribute('value');
            chrome.runtime.sendMessage({ msg: 'ADD_FAVORITE_LANGUAGE', data: selectedLanguage }).then(response => {
                fetchFavoriteLanguages(response);
            });
        });
        tags.languages.$list.append($option);
    });
}

function fetchFavoriteLanguages(favoriteLanguages: string[]) {
    tags.languages.$favorite.empty();

    favoriteLanguages.map( (favoriteLanguage: string) => {
        const $favorite = $(`<li><span>${favoriteLanguage}</span></li>`);
        const $removeButton = $(`<button value="${favoriteLanguage}" class="remove-language">X</button>`);
        $removeButton.on('click', (event) => {
            const removeLanguage = event.target.getAttribute('value');

            chrome.runtime.sendMessage({ msg: 'REMOVE_FAVORITE_LANGUAGE', data: removeLanguage }).then(response => {
                fetchFavoriteLanguages(response);
            });
        });

        $favorite.append($removeButton);
        tags.languages.$favorite.append($favorite);
    });
}

function recommandKeys(input: string) {
    const regexp = toFindRegExp(input);

    return Object.keys(LANGUAGES)
        .filter(key => regexp.test(key))
        .slice(0, 10);
}

async function loadVariables() {
    LANGUAGES = await fetchLanguageSet();
}

function addEventListeners() {
    tags.languages.$input.on('focus', () => {
        if (tags.languages.list.$container.hasClass('hide')) {
            tags.languages.list.$container.removeClass('hide');
        }
    });

    tags.languages.$input.on('input', () => {
        const value = tags.languages.$input.val() as string;

        if (value.length == 0 && !tags.languages.list.$container.hasClass('hide')) {
            tags.languages.$list.empty();
            return;
        }
        
        fetchRecommandKeys(recommandKeys(value));
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadVariables();
    addEventListeners();
    

    chrome.runtime.sendMessage({ msg: 'USER_INFO' })
    .then(github => {
        if (!github) return;
        
        showTag(tags.$loading);
        
        const octokit = new Octokit({ auth: github.accessToken });

        octokit.request('GET /user', {
            headers: {
            'X-GitHub-Api-Version': '2022-11-28'
            }
        }).then(response => {
            updatePage(response.data);
            hideTag(tags.$loading);
        });
    });

    chrome.runtime.sendMessage({ msg: 'GET_FAVORITE_LANGUAGE' }).then(response => {
        fetchFavoriteLanguages(response);
    });
});