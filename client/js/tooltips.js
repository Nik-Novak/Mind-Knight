console.log('INIT tooltips.js')
let tooltips = [
  tippy('#instructions-container .instructions', {
    content: "Follow these instructions to start a game. If you launched this client AFTER launching mindnight you can ignore 'launch mindnight' and simply start a game.",
    theme:"translucent",
    placement:'top'
  }),
  tippy('#option-tournaments', {
    content: "Not for the faint of heart",
    theme: 'translucent',
    placement: 'left'
  }),

  tippy('#option-replays', {
    content: "Under construction, check back soon",
    theme:"disabled",
    placement:'right'
  }),
  
  // tippy('#chat-log .log-search .toggle-visibility', {
  //   onTrigger: function (tip) {
  //     tip.setContent(`${$(tip.reference).children('i').first().hasClass('enabled') ? 'Show' : 'Hide'} messages that do NOT match`);
  //   },
  //   theme:'translucent',
  // }),

  // tippy('.player-img i.disconnect-icon', {
  //   content: 'This player was disconnected at the time of the shown proposal',
  //   theme:'translucent',
  //   placement: 'right'
  // }),

  // tippy('.player-img i.action-exists-icon', {
  //   content: 'This player has an action available to view',
  //   theme:'translucent',
  //   placement: 'left'
  // }),

  // tippy('.player-img i.vote-icon', {
  //   onTrigger: function (tip) {
  //     tip.setContent(`This player ${$(tip.reference).hasClass('fa-check')?'accepted':'refused'} the shown proposal`);
  //   },
  //   theme:'translucent',
  //   placement: 'right'
  // }),

  // tippy('.player-img i.hammer-icon', {
  //   content: 'This player had hammer at the time of the current shown proposal',
  //   theme:'translucent',
  //   placement: 'left'
  // }),

  // tippy('.node-container div.round-button', {
  //   content: function(element){
  //     return `Node ${$(element).attr('index')}`;
  //   },
  //   theme:'translucent',
  //   placement:'left'
  // }),
  // tippy.delegate('.turn-container', {
  //   target: 'div.round-button',
  //   onTrigger: function (tip) {
  //     tip.setContent(`Turn ${$(tip.reference).attr('index')}`);
  //   },
  //   theme:'translucent',
  //   placement:'bottom'
  // }),
]