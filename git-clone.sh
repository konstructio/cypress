#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 3 ]; then
    echo "{\"code\": 1, \"status\": 400, \"error\": \"Usage: $0 <git_owner> <gitops_token> <git_username>\"}"
    exit 1
fi

# Assign arguments to variables
git_owner=$1
gitops_token=$2
git_username=$3

# Install GitHub CLI (make sure this is necessary and handle it carefully)
# apk update
# apk add github-cli
# brew install gh

# Save the token to a file (for authentication)
echo "$gitops_token" > token.txt

# Authenticate with GitHub
gh auth login --git-protocol https --with-token < token.txt
if [ $? -ne 0 ]; then
    echo "{\"code\": 1, \"status\": 401, \"error\": \"Authentication failed.\"}"
    exit 1
fi

# Clone the repository
url="https://$gitops_token@github.com/$git_username/gitops.git"
git clone "$url"
if [ $? -ne 0 ]; then
    echo "{\"code\": 1, \"status\": 500, \"error\": \"Failed to clone repository.\"}"
    exit 1
fi

git config --global user.name "$git_owner"
git config --global user.email "1@gmail.com"

# Change directory to the cloned repository
cd gitops || { echo "{\"code\": 1, \"status\": 500, \"error\": \"Failed to change directory to gitops\"}"; exit 1; }

# Create and checkout a new branch
git checkout -b cypress-patch
if [ $? -ne 0 ]; then
    echo "{\"code\": 1, \"status\": 500, \"error\": \"Failed to checkout branch.\"}"
    exit 1
fi

# Append whitespace to the specified files
for file in terraform/vault/main.tf terraform/users/main.tf; do
    echo " " >> "$file"
done

# Add, commit, and push changes
git add .
git commit -m "whitespace changes to trigger atlantis"
# Check if the branch exists on the remote
if git ls-remote --exit-code --heads origin cypress-patch; then
    echo "Deleting remote branch cypress-patch..."
    git push origin --delete cypress-patch
    
    # Check if the delete command succeeded
    if [ $? -ne 0 ]; then
        echo "{\"code\": 1, \"status\": 500, \"error\": \"Failed to delete remote branch.\"}"
        exit 1
    fi
fi

# Attempt to push changes to the branch
git push origin cypress-patch

# Check if the push command succeeded
if [ $? -ne 0 ]; then
    echo "{\"code\": 1, \"status\": 500, \"error\": \"Failed to push changes.\"}"
    exit 1
fi

# Create a pull request
gh pr create --title "Trigger Atlantis" --body "Trigger Atlantis with whitespace changes"
if [ $? -ne 0 ]; then
    echo "{\"code\": 1, \"status\": 500, \"error\": \"Failed to create pull request.\"}"
    exit 1
fi

# Comment on the pull request (ensure you have the PR number or provide it dynamically)
gh pr comment --body "atlantis plan"
if [ $? -ne 0 ]; then
    echo "{\"code\": 1, \"status\": 500, \"error\": \"Failed to comment on pull request.\"}"
    exit 1
fi

gh pr comment --body "atlantis apply"
if [ $? -ne 0 ]; then
    echo "{\"code\": 1, \"status\": 500, \"error\": \"Failed to comment on pull request.\"}"
    exit 1
fi

# Return success response
echo "{\"code\": 0, \"status\": 200, \"error\": \"\"}"
