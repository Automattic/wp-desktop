
function usernameExists() {
    return ( process.env.E2EUSERNAME && process.env.E2EUSERNAME !== '' ) ? true : false;
}

function passwordExists() {
    return ( process.env.E2EPASSWORD && process.env.E2EPASSWORD !== '' ) ? true : false;
}

function emailExists() {
    return ( process.env.E2E_MAILOSAUR_INBOX && process.env.E2E_MAILOSAUR_INBOX !== '' ? true : false )
} 

function checkCredentials() {
    if ( !usernameExists() ) {
        throw 'Environment variable E2EUSERNAME not set';
    }

    if ( !passwordExists() ) {
        throw 'Environment variable E2EPASSWORD not set';
    }

    if ( !emailExists() ) {
        throw 'Environment variable E2E_MAILOSAUR_INBOX not set';
    }
}

exports.checkCredentials = checkCredentials;
