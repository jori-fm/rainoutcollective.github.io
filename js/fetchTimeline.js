(() => {

    const EVENTS_URL = "/events.json";

    const viewport =
        document.getElementById("timeline-viewport");

    const track =
        document.getElementById("timeline-track");

    const previousButton =
        document.getElementById("timeline-prev");

    const nextButton =
        document.getElementById("timeline-next");


    const TYPE_LABELS = {
        release: "Release",
        announcement: "Big Announcement",
        milestone: "Milestone",
        join: "Member Joins",
        leave: "Member Leaves"
    };


    const normalizeType = (type) => {

        const value =
            String(type || "")
                .trim()
                .toLowerCase();

        return TYPE_LABELS[value]
            ? value
            : "announcement";

    };


    /*
     * Supports:
     *
     * YYYY-MM
     * YYYY-MM-DD
     *
     * Month-only dates are placed on the first
     * day of that month but are displayed only
     * as month/year.
     */

    const parseDate = (value) => {

        const string =
            String(value || "").trim();

        let match =
            string.match(
                /^(\d{4})-(\d{2})(?:-(\d{2}))?$/
            );

        if (!match) {
            return null;
        }

        const year =
            Number(match[1]);

        const month =
            Number(match[2]);

        const day =
            Number(match[3] || 1);


        if (
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > 31
        ) {
            return null;
        }


        return new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );

    };


    const startOfMonth = (date) => {

        return new Date(
            Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                1
            )
        );

    };


    const addMonths = (date, amount) => {

        return new Date(
            Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth() + amount,
                1
            )
        );

    };


    const monthsBetween = (start, end) => {

        return (
            (end.getUTCFullYear() -
                start.getUTCFullYear()) *
            12
        ) +
        (
            end.getUTCMonth() -
            start.getUTCMonth()
        );

    };


    const formatMonth = (date) => {

        return new Intl.DateTimeFormat(
            "en-US",
            {
                month: "short",
                timeZone: "UTC"
            }
        ).format(date);

    };


    const formatDate = (date) => {

        return new Intl.DateTimeFormat(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC"
            }
        ).format(date);
    
    };


    const formatYear = (date) => {

        return String(
            date.getUTCFullYear()
        );

    };


    const isJanuary = (date) => {

        return date.getUTCMonth() === 0;

    };


    const getPositionRatio = (
        date,
        start,
        end
    ) => {

        const total =
            end.getTime() -
            start.getTime();

        if (total <= 0) {
            return 0.5;
        }

        return (
            (date.getTime() -
                start.getTime()) /
            total
        );

    };


    const getTrackWidth = (
        start,
        end
    ) => {

        const monthCount =
            monthsBetween(
                start,
                end
            );

        const viewportWidth =
            viewport.clientWidth;

        /*
         * 220px per month gives the timeline
         * enough breathing room while still
         * keeping close events together.
         */

        const calculated =
            360 +
            (monthCount * 220);

        return Math.max(
            viewportWidth,
            calculated
        );

    };


    const createTick = (
        date,
        position
    ) => {

        const tick =
            document.createElement("div");

        tick.className =
            "timeline-tick";

        tick.style.left =
            `${position}px`;


        const line =
            document.createElement("div");

        line.className =
            "timeline-tick-line";


        const label =
            document.createElement("div");

        label.className =
            "timeline-tick-label";

        label.textContent =
            formatMonth(date);


        tick.appendChild(line);
        tick.appendChild(label);


        if (
            isJanuary(date)
        ) {

            const year =
                document.createElement("div");

            year.className =
                "timeline-tick-year";

            year.textContent =
                formatYear(date);

            tick.appendChild(year);

        }


        return tick;

    };


    const createYearLabel = (
        date,
        position
    ) => {

        const label =
            document.createElement("div");

        label.className =
            "timeline-year-label";

        label.style.left =
            `${position}px`;

        label.textContent =
            formatYear(date);

        return label;

    };


    const createEventCard = (
        event,
        date
    ) => {

        const type =
            normalizeType(event.type);

        const wrapper =
            document.createElement("div");

        wrapper.className =
            `timeline-event timeline-${type}`;


        const card =
            document.createElement("div");

        card.className =
            "timeline-event-card";


        if (event.image) {

            const image =
                document.createElement("img");

            image.className =
                "timeline-event-image";

            image.src =
                event.image;

            image.alt =
                "";

            image.loading =
                "lazy";

            card.appendChild(image);

        }


        const copy =
            document.createElement("div");

        copy.className =
            "timeline-event-copy";


        const dateElement =
            document.createElement("div");

        dateElement.className =
            "timeline-event-date";

        dateElement.textContent =
            formatDate(date);


        const typeElement =
            document.createElement("div");

        typeElement.className =
            "timeline-event-type";

        typeElement.textContent =
            TYPE_LABELS[type];


        const description =
            document.createElement("div");

        description.className =
            "timeline-event-description";

        description.textContent =
            event.description || "";


        copy.appendChild(dateElement);
        copy.appendChild(typeElement);
        copy.appendChild(description);


        if (event.link) {

            const link =
                document.createElement("a");

            link.className =
                "timeline-event-link";

            link.href =
                event.link;

            link.textContent =
                "View more →";

            if (
                /^https?:\/\//i
                    .test(event.link)
            ) {

                link.target = "_blank";

                link.rel =
                    "noopener noreferrer";

            }

            copy.appendChild(link);

        }


        card.appendChild(copy);

        wrapper.appendChild(card);

        return wrapper;

    };


    /*
     * EVENT MARKER
     *
     * Important:
     * - Uses timeline-${type} instead of generic
     *   classes like .release.
     * - Explicitly places the marker at 50%.
     * - The CSS turns each type into its own shape.
     */

    const createMarker = (
        type,
        position
    ) => {

        const normalizedType =
            normalizeType(type);

        const marker =
            document.createElement("div");

        marker.className =
            `timeline-marker timeline-${normalizedType}`;

        marker.style.left =
            `${position}px`;

        marker.style.top =
            "50%";

        marker.setAttribute(
            "aria-hidden",
            "true"
        );

        return marker;

    };


    const createStem = (
        side,
        position,
        height
    ) => {

        const stem =
            document.createElement("div");

        stem.className =
            `timeline-stem ${side}`;

        stem.style.left =
            `${position}px`;

        stem.style.height =
            `${height}px`;

        return stem;

    };


    const assignLane = (
        lanes,
        x,
        cardWidth
    ) => {

        const minimumGap =
            cardWidth + 30;


        for (
            let i = 0;
            i < lanes.length;
            i++
        ) {

            if (
                x -
                lanes[i] >=
                minimumGap
            ) {

                lanes[i] = x;

                return i;

            }

        }


        lanes.push(x);

        return lanes.length - 1;

    };


    const renderTimeline = (
        events
    ) => {

        track.replaceChildren();


        if (!events.length) {

            const empty =
                document.createElement("div");

            empty.className =
                "timeline-empty";

            empty.textContent =
                "No timeline events yet.";

            track.appendChild(empty);

            return;

        }


        const start =
            startOfMonth(
                events[0].date
            );

        const end =
            startOfMonth(
                events[
                    events.length - 1
                ].date
            );


        const trackWidth =
            getTrackWidth(
                start,
                end
            );


        track.style.width =
            `${trackWidth}px`;


        const innerPadding =
            180;

        const usableWidth =
            Math.max(
                1,
                trackWidth -
                (innerPadding * 2)
            );


        /*
         * Month ticks
         */

        const monthCount =
            monthsBetween(
                start,
                end
            );


        for (
            let i = 0;
            i <= monthCount;
            i++
        ) {

            const month =
                addMonths(start, i);

            const ratio =
                monthCount === 0
                    ? 0
                    : i / monthCount;

            const position =
                innerPadding +
                (
                    usableWidth *
                    ratio
                );


            const tick =
                createTick(
                    month,
                    position
                );

            track.appendChild(tick);


            if (
                i === 0 ||
                isJanuary(month)
            ) {

                const yearLabel =
                    createYearLabel(
                        month,
                        position
                    );

                track.appendChild(
                    yearLabel
                );

            }

        }


        /*
         * Event lanes
         *
         * Three above the line and
         * three below the line.
         */

        const upperLanes =
            [
                -Infinity,
                -Infinity,
                -Infinity
            ];

        const lowerLanes =
            [
                -Infinity,
                -Infinity,
                -Infinity
            ];


        const cardWidth = 270;


        events.forEach(
            (event, index) => {

                const ratio =
                    getPositionRatio(
                        event.date,
                        events[0].date,
                        events[
                            events.length - 1
                        ].date
                    );


                const position =
                    innerPadding +
                    (
                        usableWidth *
                        ratio
                    );


                /*
                 * Alternate which side gets used
                 * first, then use the available lane.
                 */

                const preferUpper =
                    index % 2 === 0;


                let lane;
                let side;


                if (preferUpper) {

                    lane =
                        assignLane(
                            upperLanes,
                            position,
                            cardWidth
                        );

                    side = "above";

                } else {

                    lane =
                        assignLane(
                            lowerLanes,
                            position,
                            cardWidth
                        );

                    side = "below";

                }


                /*
                 * Keep the vertical stacking
                 * controlled.
                 */

                const laneOffset =
                    58 +
                    (lane * 112);


                const card =
                    createEventCard(
                        event,
                        event.date
                    );

                card.style.left =
                    `${position}px`;


                if (side === "above") {

                    card.classList.add(
                        "above"
                    );

                    card.style.bottom =
                        `calc(50% + ${laneOffset}px)`;

                } else {

                    card.classList.add(
                        "below"
                    );

                    card.style.top =
                        `calc(50% + ${laneOffset}px)`;

                }


                /*
                 * Marker is ALWAYS attached
                 * to the center timeline.
                 */

                const marker =
                    createMarker(
                        event.type,
                        position
                    );


                /*
                 * Stem connects the marker
                 * to the event card.
                 */

                const stem =
                    createStem(
                        side,
                        position,
                        laneOffset
                    );


                track.appendChild(stem);
                track.appendChild(marker);
                track.appendChild(card);

            }
        );


        /*
         * Start all visible elements with
         * intersection-based animation.
         */

        setupObserver();

    };


    let observer = null;


    const setupObserver = () => {

        if (observer) {
            observer.disconnect();
        }


        observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "is-visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    root: viewport,
                    threshold: 0.12
                }
            );


        track
            .querySelectorAll(
                ".timeline-event, .timeline-marker, .timeline-stem, .timeline-tick, .timeline-year-label"
            )
            .forEach(
                element => {

                    observer.observe(
                        element
                    );

                }
            );

    };


    const loadTimeline = async () => {

        try {

            const response =
                await fetch(
                    EVENTS_URL,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const rawEvents =
                await response.json();


            if (
                !Array.isArray(rawEvents)
            ) {

                throw new Error(
                    "events.json must contain an array."
                );

            }


            const events =
                rawEvents
                    .map(
                        event => {

                            return {
                                ...event,
                                parsedDate:
                                    parseDate(
                                        event.date
                                    )
                            };

                        }
                    )
                    .filter(
                        event =>
                            event.parsedDate
                    )
                    .sort(
                        (a, b) =>
                            a.parsedDate -
                            b.parsedDate
                    )
                    .map(
                        event => {

                            return {
                                ...event,
                                date:
                                    event.parsedDate
                            };

                        }
                    );


            renderTimeline(events);

        } catch (error) {

            console.error(
                "Unable to load timeline:",
                error
            );


            track.replaceChildren();


            const errorMessage =
                document.createElement("div");

            errorMessage.className =
                "timeline-error";

            errorMessage.textContent =
                "Timeline unavailable.";

            track.appendChild(
                errorMessage
            );

        }

    };


    /*
     * Horizontal mouse-wheel scrolling
     */

    viewport.addEventListener(
        "wheel",
        event => {

            if (
                Math.abs(event.deltaY) >
                Math.abs(event.deltaX)
            ) {

                event.preventDefault();

                viewport.scrollLeft +=
                    event.deltaY;

            }

        },
        {
            passive: false
        }
    );


    /*
     * Arrow controls
     */

    previousButton?.addEventListener(
        "click",
        () => {

            viewport.scrollBy({
                left: -500,
                behavior: "smooth"
            });

        }
    );


    nextButton?.addEventListener(
        "click",
        () => {

            viewport.scrollBy({
                left: 500,
                behavior: "smooth"
            });

        }
    );


    /*
     * Recalculate the timeline when the
     * browser changes size.
     */

    let resizeTimer;

    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );

            resizeTimer =
                setTimeout(
                    loadTimeline,
                    200
                );

        }
    );


    document.addEventListener(
        "DOMContentLoaded",
        loadTimeline
    );

})();