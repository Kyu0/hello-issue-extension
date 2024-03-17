import { Octokit } from '@octokit/rest';
import $ from 'jquery';

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

const $loading = $('.loading');
const $greeting = $('.greeting');
const $profile = $('.profile');

function showTag($tag: JQuery<HTMLElement>) {
    $tag.removeClass('hide');
}

function hideTag($tag: JQuery<HTMLElement>) {
    $tag.addClass('hide');
}

// TODO 1: profile 타입 축약해서 쓸 수 있는지 알아보기 ... Octokit에서 정의한 타입임
// TODO 2: 코드 가다듬기
function updatePage(profile: { login: string; id: number; node_id: string; avatar_url: string; gravatar_id: string | null; url: string; html_url: string; followers_url: string; following_url: string; gists_url: string; starred_url: string; subscriptions_url: string; organizations_url: string; repos_url: string; events_url: string; received_events_url: string; type: string; site_admin: boolean; name: string | null; company: string | null; blog: string | null; location: string | null; email: string | null; hireable: boolean | null; bio: string | null; twitter_username?: string | null | undefined; public_repos: number; public_gists: number; followers: number; following: number; created_at: string; updated_at: string; private_gists: number; total_private_repos: number; owned_private_repos: number; disk_usage: number; collaborators: number; two_factor_authentication: boolean; plan?: { collaborators: number; name: string; space: number; private_repos: number; } | undefined; suspended_at?: string | null | undefined; business_plus?: boolean | undefined; ldap_dn?: string | undefined; } | {
        login: string; id: number; node_id: string; avatar_url: string; gravatar_id: string | null; url: string; html_url: string; followers_url: string; following_url: string; gists_url: string; starred_url: string; subscriptions_url: string; organizations_url: string; repos_url: string; events_url: string; received_events_url: string; type: string; site_admin: boolean; name: string | null; company: string | null; blog: string | null; location: string | null; email: string | null; hireable: boolean | null; bio: string | null; twitter_username?: string | null | undefined; public_repos: number; public_gists: number; followers: number; following: number; created_at: string; updated_at: string; plan?: { collaborators: number; name: string; space: number; private_repos: number; } | undefined; suspended_at?: string | null | undefined; private_gists?: number | undefined; total_private_repos?: number | undefined; owned_private_repos?: number | undefined; disk_usage?: number | undefined; collaborators?: number | undefined;
    }) {
    
    $greeting.addClass('hide');
    $profile.removeClass('hide');

    const $picture = $profile.find('.picture');
    const $username = $profile.find('.username');
    const $bio = $profile.find('.bio');
    const $repository = $profile.find('.repository');

    $picture.attr('src', profile.avatar_url);
    $username.text(profile.login);
    if (profile.bio) $bio.text(profile.bio);
    $repository.attr('href', profile.repos_url);
}

// popup.html 파일에 대해서 localization을 제공하기 위해 data-locale="${messages.json의 키}" 형식으로 드러날 텍스트를 지정 후 변환
function localization() {
    document.querySelectorAll('[data-locale]').forEach(elem => {
        if (elem instanceof HTMLElement && elem.dataset.locale)
            elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
    });
}

localization();

$('.oauth.github').on('click', async () => {
    showTag($loading);
    const response: MessageResponse = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ msg: 'LOGIN_GITHUB' }, response => {
            resolve(response);
        })
    });

    if (!response.success) return;

    const authentication: Authentication = response.data;
    const octokit = new Octokit({ auth: authentication.accessToken });

    const res = await octokit.request('GET /user', {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    //avatar_url, bio: 개발자 외길 인생...!, repos_url, login
    updatePage(res.data);

    hideTag($loading);
});