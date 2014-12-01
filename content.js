
var forEach = Array.prototype.forEach;

function run() {

    $('.covers,.cover').hide();

    rebuildCreatorMixesList($('.sidebar_collection'));
}

function mixCreator(sidebarCollection) {

    var mixesByRegex = /Mixes\sBy\s([\w]+)\s?[0-9]*/i;

    var $mixByH6 = $(sidebarCollection).prev('h6');

    var matches = mixesByRegex.exec($mixByH6.text());
    if(matches) {
        return matches[1];
    }
    return '';
}

function rebuildCreatorMixesList(sidebarCollection) {
    console.log('rebuilding mixes by list');
    var $mixesByUl = $('<ul/>', { class: 'clear' });

    $(sidebarCollection).find('.mix').each(function() {

        var mixName = $(this).find('img').attr('alt');
        var mixHref = $(this).find('a:first').attr('href');

        var $mixLi = $('<li/>', { class: "mix" });
        $mixesByUl.append($mixLi);

        var $mixA = $('<a/>', {
            class: 'mix suggestion propername',
            href: mixHref
        });
        $mixLi.append($mixA);

        var $detailDiv = $('<div/>', { class: 'mix_details' });
        $mixA.append($detailDiv)

        var $titleH6 = $('<h6/>', {
            class: 'propername',
            text: mixName
        });

        $detailDiv.append($titleH6);

        var $mixBySpan = $('<span/>', {
            class: 'featherweight',
            text: 'by ' + mixCreator(sidebarCollection)
        });

        $detailDiv.append($mixBySpan);

    });

    $(sidebarCollection).replaceWith($mixesByUl);
}

function trackPageChanges() {

    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var observer = new MutationObserver(function(mutations, observer) {

        forEach.call(mutations, function (mutation) {

            forEach.call(mutation.addedNodes, function(node) {

                if(node.nodeType != 1) {
                    return;
                }

                var imgs = node.getElementsByTagName('img');

                forEach.call(imgs, function (img) {

                    if($(img).hasClass('cover')) {
                        if (!img.complete) {

                            $(img).hide();

                        } else {

                            var onLoadImage = function (event) {
                                console.log('loaded, hiding');
                                $(img).hide();
                                event.target.removeEventListener('load', onLoadImage);
                            };

                            img.addEventListener('load', onLoadImage);

                        }
                    }
                });

                var divs = node.getElementsByTagName('div');

                forEach.call(divs, function (div) {
                    if($(div).hasClass('sidebar_collection')) {
                        rebuildCreatorMixesList(div);
                    }
                });

                var spans = node.getElementsByTagName('span');
                forEach.call(spans, function (span) {
                    if($(span).hasClass('covers')) {
                        console.log('hiding cover span');
                        $(span).hide();
                    }
                });

            });
        });
    });

    observer.observe(document, {
       childList: true,
       subtree: true
    });
}

$(document).ready(function() {

    run();

    trackPageChanges();

});
