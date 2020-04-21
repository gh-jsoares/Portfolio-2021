# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="/home/roxie/.oh-my-zsh"

# Used when uploading files
export UPLOAD_API_KEY=""

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="robbyrussell"

# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in ~/.oh-my-zsh/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to automatically update without prompting.
# DISABLE_UPDATE_PROMPT="true"

# Uncomment the following line to change how often to auto-update (in days).
export UPDATE_ZSH_DAYS=3

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS=true

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in ~/.oh-my-zsh/plugins/*
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.

plugins=(
	git
	zsh-autosuggestions
	command-not-found
	copyfile
	extract
	zsh-nvm
)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
alias zshconfig='vim ~/.zshrc'
alias zshreload='source ~/.zshrc'

# alias ohmyzsh="mate ~/.oh-my-zsh"
alias ls='ls -lF --color'

# use CTRL + RIGHT_ARROW to move word forward
bindkey '^[[1;5C' forward-word
# use CTRL + LEFT_ARROW to move word backward
bindkey '^[^[[D' backward-word
# use CTRL + BACKSPACE to delete word backward
bindkey '^H' backward-kill-word
# use CTRL + DEL to delete word forward
bindkey '^[[3;5~' kill-word

# default editor
export EDITOR='vim'

# WSL clip alias
alias clip=/mnt/c/Windows/System32/clip.exe

# Perpheads file upload: usage <file|dir>
function upload() {
  function send() {
    if [ -f "$1" ]; then
      echo "Sending $1 ...";
      RESPONSE=$(curl -H "API-KEY: $UPLOAD_API_KEY" --form "file=@$1" https://files.perpheads.com/upload --progress-bar --connect-timeout 5000);

      LINK=$(grep -Po '"link": *\K"[^"]*"' <<< "$RESPONSE" | tr -d '"');
      if [ "$LINK" = "" ]; then
	echo "$RESPONSE";
	return 1;
      fi
      printf "Link copied to clipboard:\n\t> https://files.perpheads.com/%s\n" "$LINK";
      echo "https://files.perpheads.com/${LINK}" | clip;
      return 0;
    else
      echo "File not found: $1";
      return 1;
    fi
  }

  # If directory, compress first
  if [ -d "$1" ]; then
    echo "Compressing $1 ...";
    ZIP=$(printf "%s.zip" "$(date +"%H%M%S%d%m%Y")");
    zip -r "$ZIP" "$1" 2>&1 | pv -lep -s "$(ls -Rl1 "$1" | grep -Ec '^[-/]')" > /dev/null;
    send "$ZIP";
    echo "Cleaning up ...";
    rm "$ZIP";
  else
    send "$1";
  fi
}

