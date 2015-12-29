var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var jobSchema = new Schema({
    status: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    skills: [{
        type: String,
        required: true,
        trim: true
    }],
    skillsCT: [{
        type: Schema.ObjectId,
        ref: 'Skill'
    }],
    jobUrl: {
        type: String,
        required: true,
        trim: true
    },
    sendProposalData: {
        type: Object,
        trim: true
    },
    jobId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    cost: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: String,
        required: true,
        trim: true
    },
    proposalCount: {
        type: String,
        required: true,
        trim: true
    },
    costCurrency: {
        type: String,
        required: true,
        trim: true
    },
    postedDate: {
        type: String,
        required: true,
        trim: true
    }
});

jobSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('job', jobSchema);