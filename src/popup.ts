import { Octokit } from '@octokit/rest';
import $ from 'jquery';
import { showTag, hideTag, localization } from './util';

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
    }
};

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

document.addEventListener('DOMContentLoaded', () => {
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
});