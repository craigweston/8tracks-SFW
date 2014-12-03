
var forEach = Array.prototype.forEach;

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

var errors = [];
var posts = null;

var RAND_MAX_ATTEMPTS = 8;

function run() {

    $('.covers').hide();

    $('img.cover').each(function() {
        showAww($(this));
    });

    rebuildCreatorMixesList($('.sidebar_collection'));
}

function showAww(img) {

    var $img = $(img);

    $img.hide();

    if(!$img.data('aww')) {

        $(img).data('aww', true);

        if(!posts) {
            var rAwwUrl = "http://www.reddit.com/r/aww/new.json?sort=new";
            $.getJSON(rAwwUrl, function(response) {
                var posts = response.data.children
                if(posts) {
                    processAwwPosts($img, posts);
                }
            });
        } else {
             processAwwPosts($img, posts);
        }
    }
}

function processAwwPosts($img, posts) {
    var attempts = 0;

    while(attempts < RAND_MAX_ATTEMPTS) {

        var idx = Math.floor(Math.random() * posts.length);

        var post = posts[idx];

        if(post && post.data) {
            var data = post.data;

            if(!data.url.endsWith('.jpg') || -1 !== errors.indexOf(data.url)) {
                continue;
            }

            $img.error(function() {

                $(this).hide(); // hide if image fails

                errors.push(data.url); // track error images

                showAww($img) // attempt to show new image
            });

            $img.attr('src', data.url);
            $img.show();
        }

        ++attempts;
    }
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
                            showAww(img);
                        } else {

                            var onLoadImage = function (event) {
                                showAww(img);
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
