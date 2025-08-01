create table categories
(
    id          uuid      default uuid_generate_v4() not null
        constraint "PK_24dbc6126a28ff948da33e97d3b"
            primary key,
    name        varchar                              not null
        constraint "UQ_8b0be371d28245da6e4f4b61878"
            unique,
    slug        varchar                              not null
        constraint "UQ_420d9f679d41281f282f5bc7d09"
            unique,
    description varchar,
    color       varchar,
    icon        varchar,
    sort_order  integer   default 0                  not null,
    active      boolean   default true               not null,
    created_at  timestamp default now()              not null,
    updated_at  timestamp default now()              not null
);

alter table categories
    owner to postgres;

create table tags
(
    id          uuid      default uuid_generate_v4() not null
        constraint "PK_e7dc17249a1148a1970748eda99"
            primary key,
    name        varchar                              not null
        constraint "UQ_d90243459a697eadb8ad56e9092"
            unique,
    slug        varchar                              not null
        constraint "UQ_b3aa10c29ea4e61a830362bd25a"
            unique,
    description varchar,
    color       varchar,
    post_count  integer   default 0                  not null,
    active      boolean   default true               not null,
    created_at  timestamp default now()              not null,
    updated_at  timestamp default now()              not null
);

alter table tags
    owner to postgres;

create table comments
(
    id          uuid                 default uuid_generate_v4()              not null
        constraint "PK_8bf68bc960f2b69e818bdb90dcb"
            primary key,
    content     text                                                         not null,
    status      comments_status_enum default 'pending'::comments_status_enum not null,
    like_count  integer              default 0                               not null,
    reply_count integer              default 0                               not null,
    user_agent  varchar,
    ip_address  varchar,
    active      boolean              default true                            not null,
    created_at  timestamp            default now()                           not null,
    updated_at  timestamp            default now()                           not null,
    user_id     varchar                                                      not null,
    post_id     varchar                                                      not null,
    image_url   varchar,
    parent_id   varchar,
    "parentId"  uuid
        constraint "FK_8770bd9030a3d13c5f79a7d2e81"
            references comments
);

alter table comments
    owner to postgres;

create table likes
(
    id         uuid      default uuid_generate_v4() not null
        constraint "PK_a9323de3f8bced7539a794b4a37"
            primary key,
    created_at timestamp default now()              not null,
    user_id    varchar                              not null,
    post_id    varchar                              not null,
    constraint "UQ_723da61de46f65bb3e3096750d2"
        unique (post_id, user_id)
);

alter table likes
    owner to postgres;

create index "IDX_3f519ed95f775c781a25408917"
    on likes (user_id);

create index "IDX_741df9b9b72f328a6d6f63e79f"
    on likes (post_id);

create table views
(
    id         uuid      default uuid_generate_v4() not null
        constraint "PK_ae7537f375649a618fff0fb2cb6"
            primary key,
    ip_address varchar,
    user_agent varchar,
    user_id    varchar,
    post_id    varchar                              not null,
    viewed_at  timestamp default now()              not null
);

alter table views
    owner to postgres;

create index "IDX_d5c24676ccb8e6ff052870e2a3"
    on views (post_id, ip_address, user_agent);

create table posts
(
    id                  uuid              default uuid_generate_v4()         not null
        constraint "PK_2829ac61eff60fcec60d7274b9e"
            primary key,
    title               varchar                                              not null,
    slug                varchar                                              not null
        constraint "UQ_54ddf9075260407dcfdd7248577"
            unique,
    excerpt             text                                                 not null,
    content             text                                                 not null,
    featured_image      varchar,
    status              posts_status_enum default 'draft'::posts_status_enum not null,
    published_at        timestamp,
    reading_time        integer           default 0                          not null,
    view_count          integer           default 0                          not null,
    like_count          integer           default 0                          not null,
    comment_count       integer           default 0                          not null,
    share_count         integer           default 0                          not null,
    meta_title          varchar,
    meta_description    varchar,
    meta_keywords       varchar,
    og_title            varchar,
    og_description      varchar,
    og_image            varchar,
    twitter_title       varchar,
    twitter_description varchar,
    twitter_image       varchar,
    allow_comments      boolean           default true                       not null,
    active              boolean           default true                       not null,
    created_at          timestamp         default now()                      not null,
    updated_at          timestamp         default now()                      not null,
    author_id           varchar                                              not null,
    category_id         varchar
);

alter table posts
    owner to postgres;

create index "IDX_f18b722d3971386ff10ac4e3b8"
    on posts (author_id, status);

create index "IDX_3cb61174373fe05492433f5811"
    on posts (status, published_at);

create unique index "IDX_54ddf9075260407dcfdd724857"
    on posts (slug);

create table sessions
(
    id            uuid      default uuid_generate_v4() not null
        constraint "PK_3238ef96f18b355b671619111bc"
            primary key,
    token         varchar                              not null
        constraint "UQ_e9f62f5dcb8a54b84234c9e7a06"
            unique,
    refresh_token varchar,
    expires_at    timestamp                            not null,
    ip_address    varchar                              not null,
    user_agent    varchar,
    device        varchar,
    location      varchar,
    last_activity timestamp                            not null,
    active        boolean   default true               not null,
    created_at    timestamp default now()              not null,
    updated_at    timestamp default now()              not null,
    user_id       varchar                              not null
);

alter table sessions
    owner to postgres;

create index "IDX_6630fddcf4569fc0eac6b96fa3"
    on sessions (user_id, active);

create unique index "IDX_e9f62f5dcb8a54b84234c9e7a0"
    on sessions (token);

create table activity_logs
(
    id            uuid      default uuid_generate_v4() not null
        constraint "PK_f25287b6140c5ba18d38776a796"
            primary key,
    type          activity_logs_type_enum              not null,
    description   varchar,
    metadata      jsonb,
    ip_address    varchar                              not null,
    user_agent    varchar,
    resource_type varchar,
    resource_id   varchar,
    created_at    timestamp default now()              not null,
    user_id       varchar
);

alter table activity_logs
    owner to postgres;

create index "IDX_531d242aa5cea4d56810102729"
    on activity_logs (type, created_at);

create index "IDX_22a8ceffff1ef5bcfdecfe25d3"
    on activity_logs (user_id, created_at);

create table users
(
    id                       uuid                default uuid_generate_v4()           not null
        constraint "PK_a3ffb1c0c8416b9fc6f907b7433"
            primary key,
    email                    varchar                                                  not null
        constraint "UQ_97672ac88f789774dd47f7c8be3"
            unique,
    password                 varchar,
    name                     varchar                                                  not null,
    avatar                   varchar,
    bio                      varchar,
    role                     users_role_enum     default 'user'::users_role_enum      not null,
    provider                 users_provider_enum default 'local'::users_provider_enum not null,
    provider_id              varchar,
    email_verified           boolean             default false                        not null,
    email_verification_token varchar,
    password_reset_token     varchar,
    password_reset_expires   timestamp,
    two_factor_secret        varchar,
    two_factor_enabled       boolean             default false                        not null,
    last_login               timestamp,
    login_attempts           integer             default 0                            not null,
    locked_until             timestamp,
    active                   boolean             default true                         not null,
    "socialLinks"            jsonb,
    created_at               timestamp           default now()                        not null,
    updated_at               timestamp           default now()                        not null
);

alter table users
    owner to postgres;

create table post_tags
(
    post_id uuid not null
        constraint "FK_5df4e8dc2cb3e668b962362265d"
            references posts
            on update cascade on delete cascade,
    tag_id  uuid not null
        constraint "FK_192ab488d1c284ac9abe2e30356"
            references tags,
    constraint "PK_deee54a40024b7afc16d25684f8"
        primary key (post_id, tag_id)
);

alter table post_tags
    owner to postgres;

create index "IDX_5df4e8dc2cb3e668b962362265"
    on post_tags (post_id);

create index "IDX_192ab488d1c284ac9abe2e3035"
    on post_tags (tag_id);

create table comments_closure
(
    id_ancestor   uuid not null
        constraint "FK_89a2762362d968c2939b6fab193"
            references comments
            on delete cascade,
    id_descendant uuid not null
        constraint "FK_d2164211fd6ab117cfb2ab8ba96"
            references comments
            on delete cascade,
    constraint "PK_a02e5093a5d47a64f1fd473d1ef"
        primary key (id_ancestor, id_descendant)
);

alter table comments_closure
    owner to postgres;

create index "IDX_89a2762362d968c2939b6fab19"
    on comments_closure (id_ancestor);

create index "IDX_d2164211fd6ab117cfb2ab8ba9"
    on comments_closure (id_descendant);

create table saved_posts
(
    id       uuid      default uuid_generate_v4() not null
        constraint "PK_868375ca4f041a2337a1c1a6634"
            primary key,
    user_id  uuid                                 not null
        constraint "FK_78c961371a509e86d789714dd4f"
            references users
            on delete cascade,
    post_id  uuid                                 not null
        constraint "FK_116e9df57f5221cc1a77c3d1cfe"
            references posts
            on delete cascade,
    saved_at timestamp default now()              not null
);

alter table saved_posts
    owner to postgres;

create unique index "IDX_837a562f71fec3009c9af77ee5"
    on saved_posts (user_id, post_id);

-- QA System Tables
-- Questions table
CREATE TABLE questions(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('question', 'answer')),
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_target_vote UNIQUE (user_id, target_id, target_type)
);

-- Create indexes for better performance
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_votes_target ON votes(target_id, target_type);
CREATE INDEX idx_votes_user_target ON votes(user_id, target_id, target_type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

