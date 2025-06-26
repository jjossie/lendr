process.env.GOOGLE_APPLICATION_CREDENTIALS = "/Users/joel/dev/lendr/lendr-repo/firebase-project/lendr-service-account-key.json";

import * as admin from 'firebase-admin';

console.log("Initializing Firebase Admin SDK...");
admin.initializeApp();
console.log("Firebase Admin initialized.");

const db = admin.firestore();

function splitDisplayName(displayName: string | undefined): { firstName: string; lastName: string } {
    if (!displayName) return { firstName: '', lastName: '' };
    const parts = displayName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
}

async function fixLendrUserPreviews() {
    console.log("Fetching all tools from Firestore...");
    const toolsSnapshot = await db.collection('tools').get();
    console.log(`Fetched ${toolsSnapshot.size} tool(s).`);

    const batch = db.batch();
    let count = 0;

    for (const doc of toolsSnapshot.docs) {
        const data = doc.data();
        let updated = false;
        console.log(`Checking tool: ${doc.id}`);

        if (!data.lender) {
            console.log(`Adding lender to tool ${doc.id}`);

            const lenderSnapshot = await db.collection('users').doc(data.lenderUid).get();
            if (lenderSnapshot.exists) {
                const lenderData = lenderSnapshot.data();
                if (lenderData) {
                    data.lender = {
                        uid: data.lenderUid,
                        displayName: lenderData.displayName,
                        firstName: lenderData.firstName,
                        lastName: lenderData.lastName,
                        photoURL: lenderData.photoURL || '',
                    };
                    updated = true;
                } else {
                    console.warn(`Lender data not found for tool ${doc.id}`);
                }
            } else {
                console.warn(`Lender document not found for tool ${doc.id}`);
            }
            updated = true;
        }

        if (!data.holder) {
            console.log(`Adding holder to tool ${doc.id}`);

            const holderSnapshot = await db.collection('users').doc(data.holderUid).get();
            if (holderSnapshot.exists) {
                const holderData = holderSnapshot.data();
                if (holderData) {
                    data.holder = {
                        uid: data.holderUid,
                        displayName: holderData.displayName,
                        firstName: holderData.firstName,
                        lastName: holderData.lastName,
                        photoURL: holderData.photoURL || '',
                    };
                    updated = true;
                } else {
                    console.warn(`Holder data not found for tool ${doc.id}`);
                }
            } else {
                console.warn(`Holder document not found for tool ${doc.id}`);
            }
            updated = true;
        }

        if (data.lender && data.lender.displayName) {
            const { firstName, lastName } = splitDisplayName(data.lender.displayName);
            if (data.lender.firstName !== firstName || data.lender.lastName !== lastName) {
                console.log(`Updating lender name for tool ${doc.id}: '${data.lender.displayName}' -> firstName: '${firstName}', lastName: '${lastName}'`);
                data.lender.firstName = firstName;
                data.lender.lastName = lastName;
                updated = true;
            }
        }

        if (data.holder && data.holder.displayName) {
            const { firstName, lastName } = splitDisplayName(data.holder.displayName);
            if (data.holder.firstName !== firstName || data.holder.lastName !== lastName) {
                console.log(`Updating holder name for tool ${doc.id}: '${data.holder.displayName}' -> firstName: '${firstName}', lastName: '${lastName}'`);
                data.holder.firstName = firstName;
                data.holder.lastName = lastName;
                updated = true;
            }
        }

        if (!data.createdAt) {
            console.log(`Setting createdAt for tool ${doc.id}`);
            data.createdAt = admin.firestore.Timestamp.now();
            updated = true;
        }

        if (!data.modifiedAt) {
            console.log(`Setting modifiedAt for tool ${doc.id}`);
            data.modifiedAt = admin.firestore.Timestamp.now();
            updated = true;
        }

        if (updated) {
            console.log(`Batch updating tool ${doc.id}`);
            batch.update(doc.ref, {
                lender: data.lender,
                holder: data.holder,
                createdAt: data.createdAt,
                modifiedAt: data.modifiedAt,
            });
            count++;
        } else {
            console.log(`No update needed for tool ${doc.id}`);
        }
    };

    if (count > 0) {
        console.log(`Committing batch update for ${count} tool(s)...`);
        await batch.commit();
        console.log(`Updated ${count} tool(s).`);
    } else {
        console.log('No updates needed.');
    }
}

console.log("Starting fixLendrUserPreviews script...");
fixLendrUserPreviews()
    .then(() => {
        console.log("Script completed successfully.");
        process.exit(0);
    })
    .catch(err => {
        console.error("Script failed with error:", err);
        process.exit(1);
    });