// runScript.js
const { exec } = require('child_process');

// Get arguments from the command line
const gitOwner = process.argv[2];
const gitOpsToken = process.argv[3];
const gitUsername = process.argv[4];

// Construct the command to run the shell script
const command = `sh git-clone.sh ${gitOwner} ${gitOpsToken} ${gitUsername}`;

exec(command, (error, stdout, stderr) => {
    // Log the output for debugging
    // console.log('stdout:', stdout);

    if (error) {
        console.error(JSON.stringify(`error: ${error}`));
        process.exit(1); // Exit with error code
    }
    
    // Attempt to parse the JSON response
    try {
        const lastLine = stdout.trim().split('\n').pop();
        const response = JSON.parse(lastLine);
        console.log(response);
        // Check the response code
        if (response.code === 0) {
            // console.log('Script executed successfully:', response);
            process.exit(0); // Exit with success code
        } else {
            console.log('stderr:', stderr);
            // console.error('Script execution failed:', response.error);
            process.exit(1); // Exit with error code
        }
    } catch (parseError) {
        console.log(stdout);
        // console.error('Failed to parse JSON:', parseError);
        process.exit(1); // Exit with error code
    }
});
