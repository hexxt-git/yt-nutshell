import {renderVideoOnServer} from './video/renderVideo';

renderVideoOnServer((process.argv.at(-1) ?? '').split('=').at(-1) ?? '');
