#!/bin/bash

# fetch all tags in descending lexicographical order
# (exclude current tag with `awk`)
tags=$(git tag | tr - \~ | sort -V -r | tr \~ - | awk '{if(NR>1)print}')

# get tag for previous stable release from the sorted list
# (first match without `-`, e.g. v1.2.3, not v1.2.3-alpha1)
last_stable_tag=$(for tag in $tags; do if [[ ! "$tag" == *"-"* ]]; then
  echo "$tag"
  break
fi; done)

# get the current tag, fall back to HEAD
current_tag=$VERSION
if [ -z "$current_tag" ]; then
  current_tag=HEAD
fi

# Include commit message (%s). Other elements such as
# commit author (_%aN_) and commit short hash (%h) can
# be included as well.
git_log_format="%s"

# ignore types: chore, docs, style, merge
# this can be amended based on what types should be included/excluded from the release notes
git_log_incl_types="feat|fix|enhancement|refactor|perf|tests|build|ci|revert|calypso"

# Filter commits that satisfy conventional commit format
# See: https://www.conventionalcommits.org/
commit_filter="^($git_log_incl_types)(\([a-z]+\))?:\s.+"

echo "## What's Changed"

# Fill and sort changelog (final sort in commit-date order, then by type)
git_log=$(git log --oneline --pretty=format:"$git_log_format" $last_stable_tag...$current_tag |
  grep -E "$commit_filter" |
  sort -s -k 1,1)

# Map of each type to its human-readable heading
type_heading_map=("feat:New Features"
  "fix:Fixes"
  "enhancement:Enhancements"
  "refactor:Refactors"
  "perf:Performance Improvements"
  "tests:Testing"
  "build:Build"
  "ci:Continous Integration"
  "calypso:Calypso"
  "revert:Reverts")

# Returns the human-readable heading for a type
function get_type_heading() {
  for type in "${type_heading_map[@]}"; do
    KEY=${type%%:*}
    VALUE=${type#*:}
    if [[ "$KEY" == "$1" ]]; then
      echo "$VALUE"
    fi
  done
}

# Capitalizes first letter of each word
function make_title_case() {
  echo "$1" | awk '{for(i=1;i<=NF;i++){ $i=toupper(substr($i,1,1)) substr($i,2) }}1'
}

# Capitalizes beginning of string only
function make_first_letter_upper() {
  ## note: don't use ^ syntax as it is limited to bash >= v4.x
  echo "$1" | awk '{for (i=1;i<=1;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1'
}

## Print each change by doing the following:
## - parse format 'type(optional scope): description' into type, scope and description components
## - map each type to human-readable heading (as mapped in the type_heading_map array)
## - use each item scope as a human-readable subheading (formatted as "Title Cased")
## - print each item under its designated heading and subheading (formatted as "Sentence cased")

last_type=""
last_scope=""
logged_calypso=0
echo "$git_log" | while IFS=$'\r' read change; do

  type=$(echo "$change" | egrep -o '^[^:(]+')
  # Changes are sorted in descending commit date order.
  # Keep only the latest calypso update.
  if [ "$type" == "calypso" ]; then
    if [ $logged_calypso == 1 ]; then
      continue;
    fi
    logged_calypso=1;
  fi

  if [ "$last_type" != "$type" ]; then
    last_type=$type
    last_scope=""
    echo ""
    echo "### $(get_type_heading $type)"
  fi

  scope=$(echo "$change" | grep -o "\(([^)]*)\):" | tr -d '():')
  description=$(echo "$change" | sed 's/.*://')

  if [ "$scope" != "$last_scope" ]; then
    last_scope=$scope
    if [ -z "$scope" ]; then
      echo ""
      echo "#### General"
    else
      echo ""
      echo "#### $(make_title_case "$scope")"
    fi
  fi

  print_prefix='{print "- " $0}'
  echo $(make_first_letter_upper "$description") | awk "$print_prefix"

done
