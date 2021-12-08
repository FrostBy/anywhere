class Offer {
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

    constructor(params = {}) {
        this.api = new services.API();
    }

    terminate() {
        this.api.terminate();
    }

    async getOffers(ids) {
        const allOffers = await this.api.getOffers(ids, [...Offer.offerStatuses.declined, ...Offer.offerStatuses.accepted]);
        const offers = {};

        allOffers.forEach(offer => {
            const id = offer.applicant.id;
            if (!offers[id]) offers[id] = [offer];
            else offers[id].push(offer);
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
            proposals[applicantId].offers = offers;

            offersObject[applicantId] = { declined: [], accepted: [] };

            for (const offer of offers) {
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
                    locationIds.add(offer.applicant.elmLocation.id);

                    const status = proposals[applicantId].status;

                    if (['Offer Acceptance', 'Backup Consideration'].includes(status)) {
                        reportRows.push({
                            fullName: offer.applicant.fullName,
                            id: applicantId,
                            level: offer.requisition.jobFunction.name,
                            english: offer.applicant.englishLevel?.name,
                            location: offer.requisition.location.name,
                            locationId: offer.applicant.elmLocation?.id,
                            skill: offer.applicant.primarySkill?.name,
                        });
                    }

                    offersObject[applicantId].accepted.push(offerData);
                }
            }
        });

        return {
            offers: offersObject,
            reportRows,
            applicantIds: Array.from(applicantIds),
            locationIds: Array.from(locationIds)
        };
    }
}