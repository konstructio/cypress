#!/bin/bash
action=$1
shift

# Assign arguments to variables
git_owner=$1
gitops_token=$2
git_username=$3
repository=$4

echo "$gitops_token" > token.txt

url="https://$gitops_token@$repository"

login() {
    gh auth login --git-protocol https --with-token < token.txt


    if [ $? -ne 0 ]; then
        rm token.txt
        echo "Authentication failed"
        exit 1
    fi

    rm token.txt
    echo "Authentication successful"
}

clone_repository() {
    if [ -d "gitops" ]; then
        echo "Removing existing gitops directory..."
        rm -rf "gitops"
    fi

    echo "Setting git configuration..."
    git config --global user.name "$git_owner"
    git config --global user.email "kbot@konstruct.io"

    echo "Cloning repository..."
    gh repo clone "$url" gitops

    if [ $? -ne 0 ]; then
        echo "Failed to clone repository."
        exit 1
    fi


    cd gitops || { echo "Failed to change directory to gitops"; exit 1; }

    echo "Repository have been cloned successfully."
}

create_pull_request() {
    cd gitops || { echo "Failed to change directory to gitops"; exit 1; }

    if [$git_current_branch != "main"]; then
        echo "Switching to main branch..."
        git checkout main

        if [ $? -ne 0 ]; then
            echo "Failed to checkout main branch."
            exit 1
        fi
    fi

    if [ -d "cypress-patch" ]; then
        echo "Removing existing cypress-patch branch..."
        git branch -D cypress-patch

        if [ $? -ne 0 ]; then
            echo "Failed to delete branch."
            exit 1
        fi
    fi

    git checkout -b cypress-patch

    if [ $? -ne 0 ]; then
        echo "Failed to checkout branch."
        exit 1
    fi

    for file in terraform/vault/main.tf terraform/users/main.tf; do
        echo " " >> "$file"
    done

    git add .
    git commit -m "🚀 chore: whitespace changes to trigger atlantis"

    if git ls-remote --exit-code --heads $url cypress-patch; then
        echo "Deleting remote branch cypress-patch..."
        git push $url --delete cypress-patch

        if [ $? -ne 0 ]; then
            echo "Failed to delete remote branch."
            exit 1
        fi
    fi

    git push -u $url cypress-patch

    if [ $? -ne 0 ]; then
        echo "Failed to push changes."
        exit 1
    fi

    gh pr create --base main --head cypress-patch --title "🚀 Trigger Atlantis" --body "Trigger Atlantis with whitespace changes"

    if [ $? -ne 0 ]; then
        echo "Failed to create pull request."
        exit 1
    fi

}

apply() {
    echo "Changing directory to gitops..."

    cd gitops || { echo "Failed to change directory to gitops"; exit 1; }

    echo "Switching to cypress-patch branch..."

    PR_NUMBER=$(gh pr list --head cypress-patch --json number --jq '.[0].number')

    if [ -z "$PR_NUMBER" ]; then
    echo "Error: branch 'cypress-patch' not found."
    exit 1
    fi

    echo "Adding comment to #$PR_NUMBER..."
    gh pr comment "$PR_NUMBER" --body "atlantis apply"

    if [ $? -ne 0 ]; then
        echo "Failed to comment on pull request."
        exit 1
    fi

    echo "Atlantis comment has been created successfully."
}

case "$action" in
    login)
        login "$@"
        ;;
    clone_repository)
        clone_repository "$@"
        ;;
    create_pull_request)
        create_pull_request "$@"
        ;;
    apply)
        apply "$@"
        ;;
    *)
        echo "{\"code\": 1, \"status\": 400, \"error\": \"Unknown action: $action\"}"
        exit 1
        ;;
esac

