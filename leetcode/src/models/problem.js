const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemschema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },

  tags: {
    type: [String],
    enum: ["array", "linkedlist", "graph", "dp","hashmap","math","two-pointers","string"],
    required: true,
  },

  visibletestcases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
    },
  ],

  hiddentestcases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
  ],

  startcode: [
    {
      language: {
        type: String,
        required: true,
      },
      initialcode: {
        type: String,
        required: true,
      },
    },
  ],

  referencesolution: [
    {
      language: {
        type: String,
        required: true,
      },
      completecode: {
        type: String,
        required: true,
      },
    },
  ],
  drivercode: [
    {
      language: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
    },
  ],

  problemcreator: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const problem = mongoose.model('problem', problemschema);

module.exports = problem;
  