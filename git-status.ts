const {exec} = require('child_process');
const git_auth  = process.argv[2];
const git_token = process.argv[3];
const git_owner = process.argv[4];
var my_script = exec(`sh git-status.sh ${git_auth} ${git_token} ${git_owner}`,(error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }
});
