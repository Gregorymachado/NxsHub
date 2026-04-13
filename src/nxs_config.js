var currentChatFriend = null;
var currentHls = null;

var appConfig = {
    links: [
        {
            "name": "YOUTUBE",
            "url": "https://www.youtube.com",
            "icon": "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
            "desc": "Vídeos e Entretenimento"
        },
        {
            "name": "FILMES / SÉRIES",
            "url": "https://pomfy.online",
            "icon": "https://i.imgur.com/kzDj8sS.png",
            "desc": "O melhor do cinema e streaming"
        },
        {
            "name": "NETFLIX",
            "url": "https://www.netflix.com",
            "icon": "https://www.vectorlogo.zone/logos/netflix/netflix-ar21.svg",
            "desc": "Séries e filmes originais"
        },
        {
            "name": "CANAIS TV",
            "url": "javascript:toggleTV()",
            "icon": "https://www.clipartmax.com/png/full/41-410289_png-file-tv-icon-vector-png.png",
            "desc": "Televisão ao vivo em tempo real"
        },
        {
            "name": "ANIMES",
            "url": "javascript:openAnimeSubMenu()",
            "icon": "https://cdn-icons-png.flaticon.com/512/2314/2314736.png",
            "desc": "Sua central de animes favorita"
        },
        {
            "name": "MANGÁS",
            "url": "https://mangalivre.to/",
            "icon": "https://images.icon-icons.com/2516/PNG/512/book_icon_150971.png",
            "desc": "Leitura de mangás e quadrinhos"
        },
        {
            "name": "HQs",
            "url": "https://site.soquadrinhos.com/",
            "icon": "https://cdn-icons-png.flaticon.com/512/5930/5930129.png",
            "desc": "Quadrinhos e histórias"
        },
        {
            "name": "YOUR GAMER PROFILE",
            "url": "https://yourgamerprofile.com/",
            "icon": "https://i.imgur.com/OPMIhvM.jpeg",
            "desc": "Seu perfil de jogador"
        }
    ],


    tv_channels: [
        {
            "name": "GLOBO",
            "url": "https://agropesca.live/live/globosp/index.m3u8|Referer=https://rdcplayer.online/",
            "icon": "https://blogger.googleusercontent.com/img/a/AVvXsEgyjPK9uaSjepkPbKwnXg16wzG1DueL9M4v-0SvdNbevjvWRozHoimBgG-YH5Ecf3iyiSZ1K7YJpoYHX2f_a58dpdpBwpgiOOLTFGjMhTKiNtrTDPvZ4SZapoJwEol1qdMONUyWp8gVOAvJ345Ndxwu64lZZJayO-vK9hCqumHyYXPnzPsqWct1znosLmY=s600"
        },
        {
            "name": "SBT",
            "url": "https://aovivo.maissbt.com/v1/manifest/215c0da80606fed29372070168106400a6ca7e1a/SSAI_TITAN_V3/ac63b34e-0615-4402-a359-892f205ccd70/5.m3u8",
            "icon": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/7968db4b-08a8-4a7e-8a7d-7e8e2debd061/deypuf4-4a68ad24-1708-4fb2-89ff-0b5d61722fe9.png/v1/fill/w_1192,h_670,q_70,strp/sbt_logo_2021_globo_concept_cinema_4d_by_cinematronico_deypuf4-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzIwIiwicGF0aCI6Ii9mLzc5NjhkYjRiLTA4YTgtNGE3ZS04YTdkLTdlOGUyZGViZDA2MS9kZXlwdWY0LTRhNjhhZDI0LTE3MDgtNGZiMi04OWZmLTBiNWQ2MTcyMmZlOS5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.laspi0OJv2gpigrb-rkUX-5pbaJ66qOkKKkECPUaeQs"
        },
        {
            "name": "ESPN",
            "url": "https://cdn.pilarstream.com/live/espn/index.m3u8|Referer=https://multicanais.org/",
            "icon": "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/bfa4e113108983.574297622d8a9.jpg"
        },
        {
            "name": "ESPN 2",
            "url": "https://piratatvs.com/espn-2-ao-vivo/|Referer=https://piratatvs.com/",
            "icon": "https://cdn.discgolf.ultiworld.com/wp-content/uploads/2020/10/ESPN2-768x432.png"
        },
        {
            "name": "CARTOON NETWORK",
            "url": "https://origin-05.nxplay.com.br/CARTOON_NETWORK_TK/tracks-v2a1/mono.ts.m3u8?token=roku-t0k3n-v3r1fy1ng|UA=Roku/DVP-9.10 (049.10E04111A)",
            "icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Cartoon_network_modified_logo.PNG/960px-Cartoon_network_modified_logo.PNG"
        },
        {
            "name": "DISCOVERY",
            "url": "https://origin-05.nxplay.com.br/DISCOVERY_CHANNEL_NX/index.m3u8?token=roku-t0k3n-v3r1fy1ng|UA=Roku/DVP-9.10 (049.10E04111A)",
            "icon": "https://media.licdn.com/dms/image/v2/C5612AQE6aEFNu40pUw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1598567344916?e=2147483647&v=beta&t=ozhlZP80vAaPIOB8wiyPMGxmjwPJsFUevJv0REOJGs4"
        },
        {
            "name": "BBB 26",
            "icon": "https://cdn.midiamax.com.br/wp-content/uploads/2026/01/BBB-26-1.jpg",
            "submenu": [
                {
                    "name": "BBB 1",
                    "url": "https://image-storage-51.imgcontent.xyz/live/bbb26/index.m3u8|Referer=https://p2player.live/",
                    "icon": "https://especiais.globoplay.globo/panfleto/especialbbb22/images/robo-hero.png"
                }
            ]
        }
    ]
};