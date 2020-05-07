#!/bin/bash
cat > parameters.json << EOF
{
	"RepoName": "$1",
	"ProjectName": "$2",
	"Realm": "$3",
	"GitHubOwner": "$4",
	"Branch": "$5"
}
