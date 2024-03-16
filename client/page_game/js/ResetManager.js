class ResetManager{

    resetImportantInfo(){
        $('.important-info .left p, .important-info .right p').addClass('hidden');
        $('.important-info .left .proposer').empty();
        $('.important-info .right .targets').empty();
    }

    resetPlayernames(){
        $('.player-container .player-name p').empty();
    }

    resetPlayerSelects(){
        $('.player-container.selected').removeClass('selected');
    }

    resetPlayerHighlights(){
        $('.player-container.highlighted').removeClass('highlighted');
    }

    resetActionExistsIcon(){
        $('.player-container i.action-exists-icon').addClass('hidden');
    }

    resetHammerIcon(){
        $('.player-container i.hammer-icon').addClass('hidden');
    }

    resetDisconnectIcon(){
        $('.player-container i.disconnect-icon').addClass('hidden');
    }

    resetVoteIcon(){
        $('.player-container i.vote-icon').removeClass('fa-check').removeClass('fa-times');
    }

    resetAllPlayerIcons(){
        this.resetActionExistsIcon();
        this.resetHammerIcon();
        this.resetDisconnectIcon();
        this.resetVoteIcon();
    }

    resetPlayerPropNumbers(){
        $('.player-container .prop-number-container').addClass('hidden');
    }

    resetTurns(){
        var tmp = $('.turn-container').children().first().addClass('hidden');
        $('.turn-container').empty().append(tmp);
    }

    resetNodeRejects(){
        $('.noderejects-container span').html('-');
    }

    resetNodeStatuses(){
        $('.node-container .round-button-circle').attr('status', 'unknown');
    }

    resetChat(){
        $('#chat-log ul').html('');
        $('.toggle-visibility>i').addClass('fa-eye-slash');
        $('.toggle-visibility>i').removeClass('enabled');
    }

    resetElos(){
        $('.player-container .player-elo p').empty();
    }

    resetAll(){
        this.resetPlayernames();
        this.resetPlayerHighlights();
        this.resetPlayerSelects();
        this.resetAllPlayerIcons();
        this.resetPlayerPropNumbers();
        this.resetTurns();
        this.resetImportantInfo();
        this.resetNodeRejects();
        this.resetNodeStatuses();
        this.resetChat();
        this.resetElos();
    }
}