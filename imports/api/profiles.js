import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

import { checkUserExist } from "../methods/methods";

export const ProfilesDB = new Mongo.Collection("profiles");

if (Meteor.isServer) {
    Meteor.publish("profiles", function() {
        if (!this.userId) {
            this.ready();
            throw new Meteor.Error("not-logged-in");
        }

        return ProfilesDB.find(
            { _id: this.userId },
            {
                fields: {
                    displayName: 1,
                    groups: 1,
                    tags: 1,
                    bio: 1
                }
            }
        );
    });
}

Meteor.methods({
    profilesJoinGroup(groupId) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-logged-in");
        }

        checkUserExist(Meteor.userId());
        return ProfilesDB.update(
            { _id: Meteor.userId() },
            { $push: { groups: groupId } }
        );
    },

    /**
     * Add a new tag to current user
     * @param {String} _id
     * @param {String} tag
     */
    profilesAddTag(tag) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-logged-in");
        }

        checkUserExist(Meteor.userId());
        return ProfilesDB.update(
            { _id: Meteor.userId() },
            { $addToSet: { tags: tag } }
        );
    },

    profilesRemoveTag(_id, tag) {},

    /**
     * Update the bio of the current user
     * @param {String} _id
     * @param {String} newBio
     */
    profilesUpdateBio(newBio) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-logged-in");
        }

        checkUserExist(Meteor.userId());
        return ProfilesDB.update(
            { _id: Meteor.userId() },
            { $set: { bio: newBio } }
        );
    },

    /**
     * Insert new profile, called only on new user creation
     * @param {String} _id
     * @param {String} displayName
     */
    profilesInsert(_id, displayName) {
        return ProfilesDB.insert({
            _id: _id,
            displayName: displayName,
            groups: [],
            tags: [],
            bio: ""
        });
    }
});