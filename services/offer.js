class Offer {

    static get offersUrl() {
        return 'https://staffing.epam.com/api/v1/applicants/[ID]/offers';
    }

    static get offerStatuses() {
        return {
            declined: [
                'Rejected By Candidate',
                'Conditions Not Met',
            ],
            accepted: [
                'Accepted By Candidate',
            ],
        };
    }

    /*static async _getOffers(limit = 10000, page = 0, offerStatuses = [], prevOffers = []) {
        const statuses = offerStatuses.length ? offerStatuses : [...this.offerStatuses.declined, ...offerStatuses.accepted];
        const offersData = await $.get(this.allOffersUrl, {
            page,
            size: 1000,
            sort: [],
            filterType: 'approved',
            q: `offerStatus=in=("${statuses.join('","')}")`
        }).promise();

        const offers = offersData.content;
        const allOffers = prevOffers.concat(offers);

        if (offers.length >= 1000 && allOffers.length <= limit) return this._getOffers(limit, page + 1, statuses, allOffers);

        return allOffers;
    }*/

    constructor(params = {}) {}


    terminate() {
        if (this.getRequest) this.getRequest.map(request => request.abort());
    }

    async getOffers(ids) {
        if (this.getRequest) this.getRequest.map(request => request.abort());

        this.getRequest = ids.map(id => $.get(Offer.offersUrl.replace('[ID]', id)));

        const data = await Promise.all(this.getRequest.map(request => request.promise()));
        if (!data) return {};

        const offers = {};

        data.forEach(allOffers => {
            if (!allOffers.content.length) return;
            const id = allOffers.content[0].applicant.id;
            offers[id] = allOffers;
        });

        return offers;
    }

    async get(proposals) {
        const applicantIds = new Set();
        const locationIds = new Set();
        const reportRows = [];
        const offersObject = {};
        const applicantsOffers = await this.getOffers(Object.keys(proposals));

        Object.entries(applicantsOffers).map(([applicantId, offers]) => {
            proposals[applicantId].offers = offers.content;

            offersObject[applicantId] = { declined: [], accepted: [] };

            for (const offer of offers.content) {
                if (!offer.requisition || !offer.applicant) continue;

                const offerData = {
                    id: offer.id,
                    status: offer.offerStatus,
                    jobFunction: offer.requisition?.jobFunction.name,
                    changed: offer.lastStatusUpdateDate
                };

                if (Offer.offerStatuses.declined.includes(offer.offerStatus)) offersObject[applicantId].declined.push(offerData);
                else if (Offer.offerStatuses.accepted.includes(offer.offerStatus)) {
                    applicantIds.add(applicantId);
                    locationIds.add(offer.applicant.location.id);

                    const status = proposals[applicantId].status;

                    if (['Offer Acceptance', 'Backup Consideration'].includes(status)) {
                        reportRows.push({
                            fullName: offer.applicant.fullName,
                            id: applicantId,
                            level: offer.requisition.jobFunction.name,
                            english: offer.applicant.englishLevel?.name,
                            location: offer.requisition.location.name,
                            locationId: offer.applicant.location?.id,
                            skill: offer.applicant.primarySkill?.name,
                        });
                    }

                    offersObject[applicantId].accepted.push(offerData);
                }
            }
        });

        return { offers: offersObject, reportRows, applicantIds: Array.from(applicantIds), locationIds: Array.from(locationIds) };
    }
}