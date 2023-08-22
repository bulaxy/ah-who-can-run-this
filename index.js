// investigatorList updated on 20230821
const investigatorList = ["01001", "01002", "01003", "01004", "01005", "01501", "01502", "01503", "01504", "01505", "02001", "02002", "02003", "02004", "02005", "03001", "03002", "03003", "03004", "03005", "03006", "04001", "04002", "04003", "04004", "04005", "05001", "05002", "05003", "05004", "05005", "05006", "06001", "06002", "06003", "06004", "06005", "07001", "07002", "07003", "07004", "07005", "08001", "08004", "08007", "08010", "08016", "09001", "09004", "09008", "09011", "09015", "09018", "60101", "60201", "60301", "60401", "60501", "89001", "90001", "90008", "90017", "90024", "90037", "90046", "98001", "98004", "98007", "98010", "98013", "98016", "98019", "99001"]

const main = async () => {
    let url = window.location.href
    if (!url.includes(`https://arkhamdb.com/card/`)) return
    const id = url.split('/').at(-1);
    let response = await fetch('https://arkhamdb.com/api/public/card/' + id);
    let card = await response.json()

    // hide investigators
    if (card.type_code === "investigator") {
        console.log('investigator')
        return false;
    }
    if (card.faction_code === "mythos") {
        console.log('investmythosigator')
        return false;
    }
    $('#reviews-header').parent().before('<div class="col-md-12" style="margin-top:2em"><div style="line-height:34px" id="faq-header"><span style="font-size:24px">Who can play this</span></div><ul id="who-can-play"></ul></div>')
    investigatorList.map(async investigatorCode => {
        let response = await fetch('https://arkhamdb.com/api/public/card/' + investigatorCode);
        let investigator = await response.json()
        let deck = {}
        deck.deck_options = investigator.deck_options;
        // Creating for option Selected
        if (investigator.deck_options.filter(option => option.option_select).length) {
            for (let optionSelectable of investigator.deck_options.filter(option => option.option_select)) {
                let tempInvestigator = {
                    ...investigator,
                    deck_options: investigator.deck_options.map(option => !option.option_select ? option : optionSelectable)
                }
                if (can_include_card(tempInvestigator, card, deck)) {
                    let name = tempInvestigator.alternateOfName ? ("parallel "+tempInvestigator.name) : tempInvestigator.name
                    if (isNew(name)) {
                        $('#who-can-play').append('<li>' + name + '</li>')
                    }
                }
            }
        } else {
            if (can_include_card(investigator, card, deck)) {
                let name = investigator.alternateOfName ? ("parallel "+ investigator.name) : investigator.name
                if (isNew(name)) {
                    $('#who-can-play').append('<li>' + name + '</li>')
                }
            }
        }
    })
}

function isNew(text) {
    let newValue = true
    for (let o of document.querySelectorAll('#who-can-play>li')) {
        if (o.textContent == text) newValue = false
    }
    return newValue
}
function can_include_card(investigator, card, deck) {
    let investigator_code = investigator.code
    // reject cards restricted
    if (card.restrictions && card.restrictions.investigator && !card.restrictions.investigator[investigator_code]) {
        return false;
    }

    // always allow the required cards regardless
    if (investigator && investigator.deck_requirements) {
        if (investigator.deck_requirements.card && investigator.deck_requirements.card[card.code]) {
            return true;
        }
    }

    var real_slot = card.real_slot && card.real_slot.toUpperCase();

    if (deck.deck_options && deck.deck_options.length) {
        for (var i = 0; i < deck.deck_options.length; i++) {
            var option = deck.deck_options[i];
            var valid = false;

            if (option.faction_select) {
                option.faction = [...option.faction_select];
            }

            if (option.faction) {
                // needs to match at least one faction
                var faction_valid = false;
                for (var j = 0; j < option.faction.length; j++) {
                    var faction = option.faction[j];
                    if (card.faction_code == faction || card.faction2_code == faction || card.faction3_code == faction) {
                        faction_valid = true;
                    }
                }

                if (!faction_valid) {
                    continue;
                }
            }

            if (option.type) {
                // needs to match at least one faction
                var type_valid = false;
                for (var j = 0; j < option.type.length; j++) {
                    var type = option.type[j];
                    if (card.type_code == type) {
                        type_valid = true;
                    }
                }

                if (!type_valid) {
                    continue;
                }
            }

            if (option.permanent) {
                if (card.permanent !== option.permanent) {
                    continue;
                }
            }

            if (option.slot) {
                // needs to match at least one slot
                var slot_valid = false;

                for (var j = 0; j < option.slot.length; j++) {
                    var slot = option.slot[j];

                    if ((real_slot && real_slot.indexOf(slot.toUpperCase()) !== -1)) {
                        slot_valid = true;
                    }
                }

                if (!slot_valid) {
                    continue;
                }
            }

            if (option.trait) {
                // needs to match at least one trait
                var trait_valid = false;

                for (var j = 0; j < option.trait.length; j++) {
                    var trait = option.trait[j];

                    if ((card.real_traits && card.real_traits.toUpperCase().indexOf(trait.toUpperCase() + ".") !== -1)) {
                        trait_valid = true;
                    }
                }

                if (!trait_valid) {
                    continue;
                }
            }

            if (option.tag) {
                // needs to match at least one trait
                var tag_valid = false;

                for (var j = 0; j < option.tag.length; j++) {
                    var tag = option.tag[j];

                    if ((card.tags && card.tags.toUpperCase().indexOf(tag.toUpperCase() + ".") !== -1)) {
                        tag_valid = true;
                    }
                }

                if (!tag_valid) {
                    continue;
                }
            }

            if (option.uses) {
                // needs to match at least one trait
                var uses_valid = false;

                for (var j = 0; j < option.uses.length; j++) {
                    var uses = option.uses[j];

                    if ((card.real_text && card.real_text.toUpperCase().indexOf("" + uses.toUpperCase() + ").") !== -1)) {
                        uses_valid = true;
                    }
                }

                if (!uses_valid) {
                    continue;
                }

            }

            if (option.level) {
                // needs to match at least one faction
                var level_valid = false;

                if (typeof card.xp !== 'undefined' && option.level) {
                    if (card.xp >= option.level.min && card.xp <= option.level.max) {
                        level_valid = true;
                    } else {
                        continue;
                    }
                }
            }


            if (option.not) {
                return false;
            } else {
                if (option.ignore_match) {
                    continue;
                }
                return true;
            }
        }
    }

    return false;
}

main()
