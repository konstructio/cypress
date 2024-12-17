import path from "node:path";
import { exec } from "node:child_process";
import colors from "colors";

type GithubParams = {
  gitOwner: string;
  gitToken: string;
  gitUsername: string;
  baseRepository: string;
};

const GIT_COMMAND_FILE = path.resolve(__dirname, "./shell/git-commands.sh");

const doLogin = async ({
  gitOwner,
  gitToken,
  gitUsername,
  baseRepository,
}: GithubParams) => {
  const command = `${GIT_COMMAND_FILE} login ${gitOwner} ${gitToken} ${gitUsername} ${baseRepository}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
      }

      if (stderr) {
        console.log(`Message: ${stderr}`);
      }

      resolve(stdout);
    });
  });
};

const cloneRepository = async ({
  gitOwner,
  gitToken,
  gitUsername,
  baseRepository,
}: GithubParams) => {
  const command = `${GIT_COMMAND_FILE} clone_repository ${gitOwner} ${gitToken} ${gitUsername} ${baseRepository}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
      }

      if (stderr) {
        console.log(`Message: ${stderr}`);
      }

      resolve(stdout);
    });
  });
};

const createPullRequest = async ({
  gitOwner,
  gitToken,
  gitUsername,
  baseRepository,
}: GithubParams) => {
  const command = `${GIT_COMMAND_FILE} create_pull_request ${gitOwner} ${gitToken} ${gitUsername} ${baseRepository}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
      }

      if (stderr) {
        console.log(`Message: ${stderr}`);
      }

      resolve(stdout);
    });
  });
};

const applyPullRequest = async ({
  gitOwner,
  gitToken,
  gitUsername,
  baseRepository,
}: GithubParams) => {
  const command = `${GIT_COMMAND_FILE} apply ${gitOwner} ${gitToken} ${gitUsername} ${baseRepository}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
      }

      if (stderr) {
        console.log(`Message: ${stderr}`);
      }

      resolve(stdout);
    });
  });
};

export const createAtlantisPullRequestOnGithub = async (auth: GithubParams) => {
  const status = {
    login: false,
    cloneRepository: false,
    createPullRequest: false,
  };

  const loginMessage = await doLogin(auth);
  status.login = true;

  console.log(colors.green.underline("Login message:"), loginMessage);

  const cloneRepositoryMessage = await cloneRepository(auth);
  status.cloneRepository = true;

  console.log(
    colors.green.underline("Clone repository message:"),
    cloneRepositoryMessage
  );

  const createPullRequestMessage = await createPullRequest(auth);
  status.createPullRequest = true;

  console.log(
    colors.green.underline("Create pull request message:"),
    createPullRequestMessage
  );

  return status;
};

export const applyAtlantisPlan = async (auth: GithubParams) => {
  const status = {
    login: false,
    apply: false,
  };

  const loginMessage = await doLogin(auth);
  status.login = true;

  console.log(colors.green.underline("Login message:"), loginMessage);

  const applyPullRequestMessage = await applyPullRequest(auth);
  status.apply = true;

  console.log(
    colors.green.underline("Pull request apply message:"),
    applyPullRequestMessage
  );

  return status;
};
