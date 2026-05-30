package com.bigshen.blog.config;

import com.bigshen.blog.model.Article;
import com.bigshen.blog.model.Category;
import com.bigshen.blog.model.User;
import com.bigshen.blog.repository.ArticleRepository;
import com.bigshen.blog.repository.CategoryRepository;
import com.bigshen.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 应用启动时初始化基础数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;

    @Override
    @Transactional
    public void run(String... args) {
        fixExistingUsers();
        initAdminUser();
        initSampleUsers();
        initCategories();
        initSampleArticles();
        log.info("数据初始化完成");
    }

    // ==================== 用户初始化 ====================

    /**
     * 初始化管理员账号（始终确保用户名/密码/角色正确）
     */
    private void initAdminUser() {
        userRepository.findByUsername("admin").ifPresentOrElse(
                user -> {
                    boolean changed = false;
                    if (!"ADMIN".equals(user.getRole())) {
                        user.setRole("ADMIN");
                        changed = true;
                    }
                    if (!"ACTIVE".equals(user.getStatus())) {
                        user.setStatus("ACTIVE");
                        changed = true;
                    }
                    user.setPassword(passwordEncoder.encode("123456"));
                    changed = true;
                    if (changed) {
                        userRepository.save(user);
                    }
                    log.info("管理员账号已修复: admin");
                },
                () -> {
                    User admin = User.builder()
                            .username("admin")
                            .email("admin@blog.com")
                            .password(passwordEncoder.encode("123456"))
                            .role("ADMIN")
                            .status("ACTIVE")
                            .avatar("⚡")
                            .themeColor("#6C5CE7")
                            .bio("网站管理员")
                            .articleCount(0)
                            .followerCount(0)
                            .followingCount(0)
                            .build();
                    userRepository.save(admin);
                    log.info("管理员账号已创建: admin / 123456");
                }
        );
    }

    /**
     * 初始化示例用户
     */
    private void initSampleUsers() {
        createUserIfNotExists("travel_bear", "bear@blog.com", "🐻", "#FF6B8B",
                "热爱露营的旅行熊，探索世界每个角落");
        createUserIfNotExists("bunny_travel", "bunny@blog.com", "🐰", "#4ECDC4",
                "蹦蹦跳跳闯天涯，用相机记录美好");
        createUserIfNotExists("wander_cat", "cat@blog.com", "🐱", "#FFD166",
                "懒洋洋的城市漫游者，发现隐藏的美好");
    }

    private void createUserIfNotExists(String username, String email,
                                        String avatar, String themeColor, String bio) {
        if (userRepository.existsByUsername(username)) {
            return;
        }
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode("123456"))
                .role("USER")
                .status("ACTIVE")
                .avatar(avatar)
                .themeColor(themeColor)
                .bio(bio)
                .articleCount(0)
                .followerCount(0)
                .followingCount(0)
                .build();
        userRepository.save(user);
        log.info("示例用户已创建: {}", username);
    }

    private void fixExistingUsers() {
        userRepository.findAll().forEach(user -> {
            boolean changed = false;
            if (user.getRole() == null) {
                user.setRole("USER");
                changed = true;
            }
            if (user.getStatus() == null) {
                user.setStatus("ACTIVE");
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
                log.info("用户 {} 的 role/status 已修复", user.getUsername());
            }
        });
    }

    // ==================== 分类初始化 ====================

    private void initCategories() {
        createCategoryIfNotExists("日本", "🇯🇵 和风之旅，樱花与温泉的国度");
        createCategoryIfNotExists("东南亚", "🌴 热带天堂，海岛与美食的邂逅");
        createCategoryIfNotExists("国内游", "🏮 大美中国，古镇山水与城市烟火");
        createCategoryIfNotExists("欧洲", "🏰 古堡教堂，艺术与浪漫的巡礼");
        createCategoryIfNotExists("户外露营", "⛺ 星空帐篷，篝火与自然的对话");
    }

    private Category createCategoryIfNotExists(String name, String description) {
        return categoryRepository.findByName(name).orElseGet(() -> {
            Category cat = Category.builder()
                    .name(name)
                    .description(description)
                    .articleCount(0)
                    .build();
            log.info("分类已创建: {}", name);
            return categoryRepository.save(cat);
        });
    }

    // ==================== 文章初始化 ====================

    private void initSampleArticles() {
        if (articleRepository.count() > 0) {
            return; // 已有文章时不重复插入
        }

        Category japan = categoryRepository.findByName("日本").orElse(null);
        Category sea = categoryRepository.findByName("东南亚").orElse(null);
        Category china = categoryRepository.findByName("国内游").orElse(null);
        Category camping = categoryRepository.findByName("户外露营").orElse(null);

        User bear = userRepository.findByUsername("travel_bear").orElse(null);
        User bunny = userRepository.findByUsername("bunny_travel").orElse(null);
        User cat = userRepository.findByUsername("wander_cat").orElse(null);

        // --- 旅行熊的文章 ---
        createArticle(bear, "北海道冬日温泉之旅 ♨️",
                "# 北海道冬日温泉之旅\n\n" +
                "北海道的冬天，是一片银白色的童话世界。\n\n" +
                "## 登别温泉\n\n" +
                "清晨五点，推开温泉旅馆的木窗，一片雪白的世界扑面而来。" +
                "硫磺的气息混着飘落的雪花，泡在露天风吕中，头顶是零下十度的寒风，" +
                "身体却暖得像融化了一般。\n\n" +
                "## 小樽运河\n\n" +
                "傍晚沿着小樽运河散步，煤气灯映在雪地上泛起温暖的光。" +
                "路边老爷爷推着烤红薯的小车，买一个捧在手心，甜到心里。\n\n" +
                "> 旅行小贴士：建议购买JR北海道周游券，可以无限次乘坐特急列车，非常划算。",
                "从登别温泉到小樽运河，在北海道的雪国里泡温泉、吃拉面、拍美照的冬日漫游记。",
                japan, List.of("日本", "北海道", "温泉", "冬日", "自由行"), "日本·北海道",
                LocalDate.of(2026, 1, 15), 1280, 89, 12);

        createArticle(bear, "富士山下露营记 ⛺",
                "# 富士山下露营记\n\n" +
                "在富士山脚下搭帐篷，是什么体验？\n\n" +
                "## 本栖湖营地\n\n" +
                "选择了富士五湖中最安静的本栖湖。下午三点到达时，湖面平静如镜，" +
                "富士山的倒影清晰地映在水中——这就是日币千元钞上的景色！\n\n" +
                "## 篝火之夜\n\n" +
                "夜幕降临后生起篝火，烤着棉花糖看星空。湖对岸只有零星几点灯光，" +
                "整个世界安静得只剩下柴火噼啪的声音。\n\n" +
                "凌晨四点被鸟鸣唤醒，拉开帐篷——粉紫色的朝霞正从富士山背后升起。",
                "在本栖湖畔搭帐篷，烤棉花糖看星空，清晨被富士山的朝霞唤醒。",
                camping, List.of("露营", "富士山", "户外", "星空"), "日本·山梨县",
                LocalDate.of(2025, 8, 20), 950, 56, 8);

        // --- 小兔的文章 ---
        createArticle(bunny, "巴厘岛乌布稻田漫游 🌾",
                "# 巴厘岛乌布稻田漫游\n\n" +
                "乌布是巴厘岛的灵魂，而我在这片稻田里找到了旅行的意义。\n\n" +
                "## 德格拉朗梯田\n\n" +
                "清晨六点到达德格拉朗梯田时，晨雾还缠绕在椰子树梢。" +
                "沿着田埂慢慢走，遇到一位正在收割的老农，他微笑着递给我一串新鲜的椰子。\n\n" +
                "## 圣猴森林\n\n" +
                "下午去了圣猴森林公园，小猴子们完全不怕人。" +
                "有一只还偷偷跳上我的肩膀，摄影师朋友抓拍到了那个瞬间——" +
                "那是我此行最喜欢的照片。\n\n" +
                "## 稻田晚餐\n\n" +
                "傍晚在稻田中央的竹亭里享用晚餐，烛光摇曳，远处传来甘美兰音乐。",
                "在乌布的梯田间漫步，与猴子交朋友，傍晚在稻田竹亭享用浪漫晚餐。",
                sea, List.of("巴厘岛", "乌布", "稻田", "东南亚", "治愈"), "印尼·巴厘岛",
                LocalDate.of(2025, 11, 5), 1560, 112, 18);

        createArticle(bunny, "清迈古城48小时吃遍路边摊 🍜",
                "# 清迈古城48小时吃遍路边摊\n\n" +
                "如果说曼谷是泰国的门面，那清迈就是它的胃。\n\n" +
                "## 周六夜市\n\n" +
                "从塔佩门一路走到帕辛寺，整条街都是美食摊位。" +
                "芒果糯米饭、泰北香肠、青木瓜沙拉、炸猪皮……\n" +
                "边走边吃，两个小时后发现自己已经撑得走不动了。\n\n" +
                "## 必吃清单\n\n" +
                "1. **Khao Soi（泰北咖喱面）** — 浓郁椰奶配上脆面条，一口入魂\n" +
                "2. **Sai Oua（泰北香肠）** — 香茅草和柠檬叶的清香\n" +
                "3. **Mango Sticky Rice** — 清迈芒果甜得像蜜一样\n\n" +
                "> 清迈的物价感人，一顿路边摊人均30-50泰铢（约6-10元人民币）。",
                "48小时吃遍清迈古城的路边摊美食，从泰北咖喱面到芒果糯米饭。",
                sea, List.of("清迈", "泰国", "美食", "路边摊", "东南亚"), "泰国·清迈",
                LocalDate.of(2026, 2, 28), 2100, 178, 25);

        // --- 懒猫的文章 ---
        createArticle(cat, "丽江古城慢生活 🏮",
                "# 丽江古城慢生活\n\n" +
                "在丽江，时间好像被拉长了。\n\n" +
                "## 四方街的下午\n\n" +
                "找一个临街的咖啡馆二楼坐下，点一杯云南小粒咖啡。" +
                "楼下纳西族奶奶在织布，隔壁传来手鼓声，远处玉龙雪山若隐若现。\n\n" +
                "## 束河古镇\n\n" +
                "相比大研古城的热闹，束河多了一份宁静。" +
                "沿着青龙河走，河水清澈见底，水草在水底轻轻摇曳。" +
                "找了一家马帮菜馆，腊排骨火锅配酥油茶，人均不到五十。\n\n" +
                "在这里，不需要赶行程，最好的安排就是没有安排。",
                "在四方街喝咖啡看雪山，在束河吃腊排骨火锅，丽江的慢生活让人不想离开。",
                china, List.of("丽江", "古镇", "慢生活", "云南", "独自旅行"), "云南·丽江",
                LocalDate.of(2025, 9, 12), 1870, 145, 22);

        createArticle(cat, "一个人的厦门海边骑行 🚲",
                "# 一个人的厦门海边骑行\n\n" +
                "租一辆单车，沿着环岛路一直骑——这是我给自己安排的周末。\n\n" +
                "## 环岛路\n\n" +
                "从曾厝垵出发，一路向东。海风带着咸味，阳光透过棕榈树洒下斑驳的影子。" +
                "骑行道平整宽阔，偶尔有慢跑的人擦肩而过，彼此点头微笑。\n\n" +
                "## 黄厝海滩\n\n" +
                "骑累了就在黄厝海滩停下来。脱掉鞋子踩在细沙上，" +
                "海浪一遍遍冲刷着脚踝。坐在沙滩上看夕阳一点点沉入海里，天空从金黄变成粉紫。\n\n" +
                "## 沙坡尾\n\n" +
                "傍晚骑到沙坡尾艺术西区，老厂房改造成了创意空间。" +
                "在一家猫咖啡馆歇脚，三只橘猫慵懒地趴在窗台上，这就是我向往的生活。",
                "环岛路骑行，黄厝海滩看夕阳，沙坡尾撸猫——一个人的厦门周末。",
                china, List.of("厦门", "骑行", "海边", "周末游", "独自旅行"), "福建·厦门",
                LocalDate.of(2026, 3, 8), 1120, 67, 9);

        // --- 旅行熊的第三篇 ---
        createArticle(bear, "阿尔卑斯山下的童话小镇 🏔️",
                "# 阿尔卑斯山下的童话小镇\n\n" +
                "瑞士的格林德瓦，是我见过最像童话的地方。\n\n" +
                "## 梦幻山坡\n\n" +
                "坐缆车上到First峰，往下看就是著名的「梦幻山坡」——" +
                "翠绿的草甸上散落着一栋栋小木屋，远处是白雪皑皑的艾格峰北壁。" +
                "阳光洒下来，整片山谷都在发光。\n\n" +
                "## Bachalpsee湖\n\n" +
                "徒步一小时到达Bachalpsee高山湖，湖水倒映着雪山，美得不真实。" +
                "坐在湖边野餐，面包配瑞士奶酪，最简单的一餐却最难忘。\n\n" +
                "## 傍晚\n\n" +
                "回到镇上，教堂的钟声在山谷间回荡。家家户户窗口亮起暖黄的灯光，" +
                "空气里飘着奶酪火锅的味道。这才是旅行该有的样子。",
                "从梦幻山坡到高山湖，在瑞士格林德瓦遇见阿尔卑斯的纯粹之美。",
                categoryRepository.findByName("欧洲").orElse(null),
                List.of("瑞士", "阿尔卑斯", "格林德瓦", "徒步", "自然"), "瑞士·格林德瓦",
                LocalDate.of(2025, 7, 3), 2300, 203, 31);

        log.info("示例文章已创建: {} 篇", articleRepository.count());
    }

    /**
     * 创建一篇文章
     */
    private void createArticle(User author, String title, String content, String summary,
                                Category category, List<String> tags, String location,
                                LocalDate travelDate, int viewCount, int likeCount, int commentCount) {
        Article article = Article.builder()
                .title(title)
                .content(content)
                .summary(summary)
                .author(author)
                .category(category)
                .tags(tags)
                .status("PUBLISHED")
                .location(location)
                .travelDate(travelDate)
                .viewCount(viewCount)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .build();
        articleRepository.save(article);

        // 更新作者文章数
        if (author != null) {
            author.setArticleCount(author.getArticleCount() + 1);
            userRepository.save(author);
        }

        // 更新分类文章数
        if (category != null) {
            category.setArticleCount(category.getArticleCount() + 1);
            categoryRepository.save(category);
        }

        log.info("文章已创建: {}", title);
    }
}
