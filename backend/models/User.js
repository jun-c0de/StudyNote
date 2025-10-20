const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [EMAIL_REGEX, "유효한 이메일이 아닙니다."]
        },
        passwordHash: {
            type: String,
            required: true
        },
        displayName: {
            type: String,
            trim: true,
            default: ""
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            index: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isLoggined: {
            type: Boolean,
            default: false
        },
        loginAttempts: {
            type: Number,
            default: 0
        },
        lastLoginAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// compare plain password to hash
userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

// set password (hash)
userSchema.methods.setPassword = async function (plain) {
    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const salt = await bcrypt.genSalt(rounds);
    this.passwordHash = await bcrypt.hash(plain, salt);
};

// safe JSON (hide passwordHash and internal fields)
userSchema.methods.toSafeJSON = function () {
    const obj = this.toObject({ versionKey: false });
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
};

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
