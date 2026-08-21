/**
 * Trà Đạo Thái Nguyên - Master Application Logic & State Management
 * Includes: Auth Gatekeeper, Expanded Products & Teaware Store, Dynamic Detail View, 
 * Category Filters, Interactive Feedback System, Luxury Cart Drawer, and Floating Zalo/Messenger Chat
 */

// ==================== 0. IMMEDIATE AUTH GATEKEEPER ====================
// Khi mở bất kỳ trang nào (trừ auth.html), nếu chưa đăng nhập sẽ tự động chuyển ngay sang auth.html
(function checkImmediateAuth() {
  const currentPath = window.location.pathname.toLowerCase();
  const isAuthPage = currentPath.endsWith('auth.html') || currentPath.endsWith('auth') || currentPath.includes('/auth');
  const isLoggedIn = localStorage.getItem('tra_dao_is_logged_in') === 'true';

  if (!isLoggedIn && !isAuthPage) {
    window.location.replace('auth.html');
  }
})();

// Master Products & Teaware Database with Real High-Definition Images
const MASTER_PRODUCTS = {
  // ==================== 4 BEST-SELLING TEAS ====================
  '1': {
    id: '1',
    title: 'Trà Đinh Tân Cương Thượng Hạng',
    category: 'Trà Thượng Hạng',
    categoryType: 'tea',
    filterTag: 'tradinh',
    price: '1.500.000 ₫',
    priceNum: 1500000,
    unit: '/ Hộp 500g',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    origin: 'Tân Cương, Thái Nguyên',
    standard: '1 Tôm non sớm mai khi còn đọng sương',
    flavor: 'Hương cốm non nồng nàn, tiền chát thanh dịu, hậu ngọt sâu lắng đọng vô cùng',
    package: 'Hộp thiếc bát giác mạ vàng cao cấp lót lụa',
    desc: 'Được mệnh danh là "Nhất phẩm trà Việt", Trà Đinh Tân Cương được nghệ nhân tuyển chọn thu hái thủ công từ những búp trà đinh non 1 tôm sớm mai khi còn đọng sương mai tinh khiết. Trà khi pha cho sắc nước xanh vàng ánh ngọc, hương thơm cốm non thanh tao ngào ngạt, tiền vị chát dịu êm ái và hậu vị ngọt đượm kéo dài bền lâu trong khoang miệng.',
    icon: '🍵',
    reviews: [
      { author: 'Bác Nguyễn Văn Cường (Hà Nội)', date: '18/08/2026', stars: 5, text: 'Tôi uống trà Thái Nguyên đã gần 40 năm nay, dòng Trà Đinh này của quán thực sự đạt chuẩn thượng hạng. Cánh trà nhỏ tăm tắp phủ tuyết trắng, nước trong xanh ánh vàng, hương cốm thơm lừng cả gian phòng khách. Mua biếu tặng bạn bè ai cũng khen ngợi nức nở.' },
      { author: 'Chị Trần Thị Mai (Đà Nẵng)', date: '12/08/2026', stars: 5, text: 'Hộp thiếc mạ vàng cầm rất đầm tay, lịch sự và sang trọng. Shop giao hàng hỏa tốc đóng gói cẩn thận chống sốc rất kỹ. Nước trà ngọt hậu rất lâu, uống xong súc miệng vẫn thấy ngọt dịu cổ họng.' }
    ]
  },
  '2': {
    id: '2',
    title: 'Trà Nõn Tôm Thượng Hạng',
    category: 'Trà Đặc Sản',
    categoryType: 'tea',
    filterTag: 'nontom',
    price: '850.000 ₫',
    priceNum: 850000,
    unit: '/ Hộp 500g',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
    origin: 'Vùng chè Tân Cương, Thái Nguyên',
    standard: '1 Tôm 1 Lá non liền kề chuẩn chỉ',
    flavor: 'Hương thơm mộc thuần khiết, vị đượm đà truyền thống xứ Bắc',
    package: 'Túi hút chân không đóng hộp quà biếu mỹ thuật',
    desc: 'Trà Nõn Tôm được chọn lọc kỹ càng theo quy chuẩn nghiêm ngặt: 1 tôm 1 lá non liền kề vào lúc sáng sớm. Cánh trà xoăn nhỏ đều tăm tắp, phủ một lớp phấn trắng tự nhiên. Nước trà màu xanh ánh vàng óng ánh, vị chát dịu hài hòa và vị ngọt hậu đậm đà rất đặc trưng.',
    icon: '🌿',
    reviews: [
      { author: 'Anh Lê Hoàng Nam (Hải Phòng)', date: '15/08/2026', stars: 5, text: 'Trà rất thơm, đậm đà mà không bị khé cổ. Tôi mua uống hàng ngày và tiếp khách văn phòng, ai cũng hỏi địa chỉ mua.' },
      { author: 'Bác Phạm Hữu Tiến (Thái Bình)', date: '08/08/2026', stars: 5, text: 'Giao hàng nhanh chóng, bao bì đóng gói hút chân không rất kín đáo, giữ nguyên hương vị cốm non của trà mới.' }
    ]
  },
  '3': {
    id: '3',
    title: 'Trà Móc Câu Hảo Hạng',
    category: 'Trà Truyền Thống',
    categoryType: 'tea',
    filterTag: 'moccau',
    price: '480.000 ₫',
    priceNum: 480000,
    unit: '/ Hộp 500g',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=80',
    origin: 'La Bằng - Tân Cương, Thái Nguyên',
    standard: '1 Tôm 2 Lá non truyền thống',
    flavor: 'Hương cốm dịu ngọt, tiền vị chát vừa phải, hậu ngọt bùi sâu',
    package: 'Hộp giấy thủ công thân thiện môi trường',
    desc: 'Dòng trà cổ truyền gắn liền với văn hóa thưởng trà xứ Bắc qua nhiều thế hệ. Cánh trà cong hình móc câu đặc trưng, khi pha tỏa hương thơm ngát, vị trà đượm đà chân thật, là thức uống tuyệt vời cho các buổi hàn huyên tâm giao mỗi sáng.',
    icon: '🍃',
    reviews: [
      { author: 'Bác Đặng Đình Phúc (Nam Định)', date: '10/08/2026', stars: 5, text: 'Đúng vị trà Móc Câu truyền thống ngày xưa, chát đậm đà mà hậu vị ngọt bùi dễ chịu. Giá cả rất hợp lý.' }
    ]
  },
  '4': {
    id: '4',
    title: 'Trà Shan Tuyết Cổ Thụ Hà Giang',
    category: 'Trà Cổ Thụ',
    categoryType: 'tea',
    filterTag: 'shantuyet',
    price: '1.200.000 ₫',
    priceNum: 1200000,
    unit: '/ Hộp 300g',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80',
    origin: 'Dãy Tây Côn Lĩnh (Độ cao > 1800m)',
    standard: 'Búp trà cổ thụ bọc lông tuyết trắng tự nhiên',
    flavor: 'Hương thanh khiết núi rừng Tây Bắc, vị ngọt mật ong rừng',
    package: 'Hộp gỗ thông khắc laser mộc mạc tinh tế',
    desc: 'Thu hái từ những cây trà cổ thụ hàng trăm năm tuổi ngự trên đỉnh núi cao Tây Côn Lĩnh quanh năm mây mù bao phủ. Búp trà phủ lớp tuyết trắng mịn, mang năng lượng thuần khiết của đất trời.',
    icon: '🏔️',
    reviews: [
      { author: 'Lương y Hoàng Văn Thọ (Hà Nội)', date: '05/08/2026', stars: 5, text: 'Trà có dược tính rất tốt, pha được 7-8 tuần nước mà hương vị vẫn ngọt ngào như mật rừng.' }
    ]
  },

  // ==================== EXPANDED TEAWARE CATEGORIES ====================
  // 1. Ấm Tử Sa & Ấm Sứ
  'tw-1': {
    id: 'tw-1',
    title: 'Ấm Tử Sa Thạch Biều Đất Tử Nê',
    category: 'Ấm Tử Sa & Ấm Sứ',
    categoryType: 'teaware',
    filterTag: 'zisha',
    price: '1.850.000 ₫',
    priceNum: 1850000,
    unit: '/ Chiếc',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=600&q=80',
    origin: 'Nghi Hưng Tuyển Chọn',
    standard: 'Đất Tử Nê nguyên khoáng nung 1180°C',
    flavor: 'Dung tích 220ml, ngắt nước dứt khoát, giữ nhiệt xuất sắc',
    package: 'Hộp gấm lót lụa chống sốc cao cấp',
    desc: 'Dáng ấm Thạch Biều kinh điển với thế ấm tam giác vững chãi, dòng nước suôn mượt ngắt dòng dứt khoát. Chất đất Tử Nê giàu khoáng vi lượng giúp lưu hương trà bền lâu và nâng tầm trải nghiệm thưởng trà đạo.',
    icon: '🫖',
    reviews: [
      { author: 'Nghệ nhân trà Trần Bách (TP. HCM)', date: '14/08/2026', stars: 5, text: 'Độ kín nắp ấm tuyệt đối, dòng nước rót tròn đều và cắt nước rất gọn gàng. Đất tử nê thật nuôi trà lên nước rất nhanh.' }
    ]
  },
  'tw-2': {
    id: 'tw-2',
    title: 'Ấm Tử Sa Tây Thi Đất Chu Nê',
    category: 'Ấm Tử Sa & Ấm Sứ',
    categoryType: 'teaware',
    filterTag: 'zisha',
    price: '1.650.000 ₫',
    priceNum: 1650000,
    unit: '/ Chiếc',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    origin: 'Đất Chu Nê Triệu Trang',
    standard: 'Thủ công nguyên bản, độ co ngót chuẩn 22%',
    flavor: 'Dung tích 180ml, dòng chảy êm dịu, tôn vinh hương cốm non',
    package: 'Hộp gỗ quà tặng nghệ nhân',
    desc: 'Dáng ấm Tây Thi tròn đầy đặn, nắp ấm vừa vặn khít khao như ngọc. Chất đất Chu Nê sắc đỏ trầm ấm, thẩm thấu hương trà cực nhanh, là báu vật không thể thiếu của người sành trà.',
    icon: '🫖',
    reviews: [
      { author: 'Bác Ngô Quốc Huy (Hải Dương)', date: '09/08/2026', stars: 5, text: 'Dáng Tây Thi rất thanh thoát, cầm rót trà rất đầm và êm tay. Ấm giữ nhiệt tốt, pha trà đinh cực đượm vị.' }
    ]
  },
  'tw-3': {
    id: 'tw-3',
    title: 'Ấm Tử Sa Đức Chung Đất Đại Hồng Bào',
    category: 'Ấm Tử Sa & Ấm Sứ',
    categoryType: 'teaware',
    filterTag: 'zisha',
    price: '2.200.000 ₫',
    priceNum: 2200000,
    unit: '/ Chiếc',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=600&q=80',
    origin: 'Khoáng Đất Quý Đại Hồng Bào',
    standard: 'Nghệ nhân cao cấp tạo tác',
    flavor: 'Dung tích 240ml, dòng nước mạnh mẽ, tạo khí chất uy nghiêm',
    package: 'Hộp gấm thêu rồng cao cấp',
    desc: 'Dáng Đức Chung biểu trưng cho khí phách ngay thẳng, đĩnh đạc. Chất đất Đại Hồng Bào nguyên khoáng hiếm có, sắc đỏ rực rỡ, bề mặt mịn màng như da em bé.',
    icon: '🫖',
    reviews: [
      { author: 'Thầy Hoàng Văn Minh (Bắc Giang)', date: '04/08/2026', stars: 5, text: 'Tuyệt tác ấm trà, nắp ấm mút chặt kín hơi, pha trà Shan Tuyết hay Trà Đinh đều đạt đỉnh cao hương vị.' }
    ]
  },
  'tw-4': {
    id: 'tw-4',
    title: 'Ấm Sứ Men Lam Cảnh Đức Trấn Vẽ Tay',
    category: 'Ấm Tử Sa & Ấm Sứ',
    categoryType: 'teaware',
    filterTag: 'zisha',
    price: '1.350.000 ₫',
    priceNum: 1350000,
    unit: '/ Chiếc',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    origin: 'Cảnh Đức Trấn Cổ Truyền',
    standard: 'Sứ nung củi 1320°C, họa tiết sơn thủy vẽ tay',
    flavor: 'Dung tích 200ml, lòng men ngọc không bám ố, dễ vệ sinh',
    package: 'Hộp quà biếu truyền thống',
    desc: 'Nghệ thuật men lam vẽ tay tinh xảo bức tranh sơn thủy hữu tình. Chất sứ trắng ngà thấu quang, giữ trọn vẹn hương vị thanh khiết nguyên bản của các dòng trà quý.',
    icon: '🫖',
    reviews: [
      { author: 'Chị Đỗ Thu Hà (Hà Nội)', date: '30/07/2026', stars: 5, text: 'Họa tiết vẽ tay rất có hồn, sứ trắng trong vắt soi bóng nước trà rất tao nhã.' }
    ]
  },

  // 2. Bộ Chén Trà
  'tw-5': {
    id: 'tw-5',
    title: 'Bộ 6 Chén Sứ Bạch Ngọc Viền Vàng 24K',
    category: 'Bộ Chén Trà',
    categoryType: 'teaware',
    filterTag: 'cups',
    price: '650.000 ₫',
    priceNum: 650000,
    unit: '/ Bộ 6 Chén',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=600&q=80',
    origin: 'Lò gốm nghệ nhân Bát Tràng',
    standard: 'Sứ thấu quang cao cấp mạ chỉ vàng 24K',
    flavor: 'Lòng chén trắng ngọc soi trọn vẹn sắc nước xanh vàng của trà',
    package: 'Hộp quà biếu lót lụa sang trọng',
    desc: 'Chất sứ thấu quang siêu mỏng, soi đèn thấy ánh sáng xuyên qua. Miệng chén vẽ chỉ vàng tinh xảo, kích thước vừa vặn bàn tay giúp cảm nhận trọn vẹn hơi ấm và hương thơm ngào ngạt của trà.',
    icon: '🥣',
    reviews: [
      { author: 'Chị Vũ Minh Trang (Hà Nội)', date: '11/08/2026', stars: 5, text: 'Chén sứ rất nhẹ và mỏng tang, uống trà Tân Cương nhìn nước màu xanh ngọc bích cực kỳ đẹp mắt.' }
    ]
  },
  'tw-6': {
    id: 'tw-6',
    title: 'Bộ 6 Chén Men Rạn Cổ Bát Tràng',
    category: 'Bộ Chén Trà',
    categoryType: 'teaware',
    filterTag: 'cups',
    price: '580.000 ₫',
    priceNum: 580000,
    unit: '/ Bộ 6 Chén',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    origin: 'Làng gốm cổ Bát Tràng',
    standard: 'Men rạn tam thái nung truyền thống',
    flavor: 'Giữ nhiệt đầm ấm, dáng chén đốt trúc thanh cao',
    package: 'Hộp giấy mỹ thuật mộc mạc',
    desc: 'Vân men rạn tự nhiên mang dấu ấn thời gian cổ kính. Từng đường rạn li ti như rễ tre, biểu trưng cho sự trường tồn và cốt cách thanh cao của bậc quân tử.',
    icon: '🥣',
    reviews: [
      { author: 'Bác Lê Văn Dũng (Thái Nguyên)', date: '06/08/2026', stars: 5, text: 'Men rạn Bát Tràng rất có chiều sâu, uống trà mộc nhìn rất đượm và xưa.' }
    ]
  },
  'tw-7': {
    id: 'tw-7',
    title: 'Bộ 6 Chén Men Hỏa Biến Thiên Mục Lam',
    category: 'Bộ Chén Trà',
    categoryType: 'teaware',
    filterTag: 'cups',
    price: '720.000 ₫',
    priceNum: 720000,
    unit: '/ Bộ 6 Chén',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    origin: 'Nghệ Thuật Men Hỏa Biến',
    standard: 'Màu men biến ảo diệu kỳ theo nhiệt độ lò',
    flavor: 'Lòng chén óng ánh như dải ngân hà ngọc bích',
    package: 'Hộp chống sốc cao cấp',
    desc: 'Mỗi chiếc chén là một độc bản duy nhất của ngọn lửa thiêng. Sắc xanh lam biến ảo lung linh dưới ánh sáng, khi rót trà vào tạo nên hiệu ứng thị giác tuyệt mỹ.',
    icon: '🥣',
    reviews: [
      { author: 'Anh Trịnh Tuấn Anh (Vũng Tàu)', date: '01/08/2026', stars: 5, text: 'Hiệu ứng men hỏa biến quá đẹp, màu nước trà phản chiếu như viên ngọc phát sáng.' }
    ]
  },

  // 3. Khay Trà Gỗ Quý
  'tw-8': {
    id: 'tw-8',
    title: 'Khay Trà Gỗ Gụ Khắc Họa Tiết Mây',
    category: 'Khay Trà Gỗ Quý',
    categoryType: 'teaware',
    filterTag: 'tray',
    price: '1.250.000 ₫',
    priceNum: 1250000,
    unit: '/ Chiếc',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
    origin: 'Làng nghề mộc Đồng Kỵ',
    standard: 'Gỗ gụ ta nguyên khối tuyển chọn vân tự nhiên',
    flavor: 'Kèm khay inox hứng nước thông minh tháo rời',
    package: 'Bọc xốp khí đóng thùng gỗ cẩn thận',
    desc: 'Chế tác từ chất gỗ gụ ta tự nhiên với vân gỗ cuộn sóng tuyệt mỹ. Họa tiết mây trôi cung đình được nghệ nhân chạm khắc tỉ mỉ, bề mặt phủ sáp ong tự nhiên bóng mịn sang trọng.',
    icon: '🪵',
    reviews: [
      { author: 'Bác Nguyễn Đức Vinh (Quảng Ninh)', date: '02/08/2026', stars: 5, text: 'Khay trà gỗ gụ rất đầm và chắc chắn, nước tráng ấm thoát nhanh không hề bị ứ đọng hay rò rỉ.' }
    ]
  },
  'tw-9': {
    id: 'tw-9',
    title: 'Khay Trà Gỗ Mun Hoa Đen Nguyên Khối',
    category: 'Khay Trà Gỗ Quý',
    categoryType: 'teaware',
    filterTag: 'tray',
    price: '2.450.000 ₫',
    priceNum: 2450000,
    unit: '/ Chiếc',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    origin: 'Gỗ Mun Sừng Quý Hiếm',
    standard: 'Đục nguyên khối, không chắp ghép, đầm nặng 4.5kg',
    flavor: 'Chống thấm nước tuyệt đối, vân hoa đen tuyền quyền lực',
    package: 'Thùng gỗ bảo hộ kèm chứng thư gỗ',
    desc: 'Được tôn vinh là vương giả của các loại khay trà, gỗ mun đen bóng mượt như ngọc đen. Bền bỉ hàng trăm năm không mục nát, tăng thêm vẻ uy nghiêm cho bàn trà tiếp khách.',
    icon: '🪵',
    reviews: [
      { author: 'Doanh nhân Vũ Đình Toàn (Hà Nội)', date: '25/07/2026', stars: 5, text: 'Gỗ mun sừng rất nặng và giá trị, đặt trong phòng khách nhìn cực kỳ sang trọng và đẳng cấp.' }
    ]
  },
  'tw-10': {
    id: 'tw-10',
    title: 'Khay Trà Tre Tự Nhiên Chống Ẩm Cao Cấp',
    category: 'Khay Trà Gỗ Quý',
    categoryType: 'teaware',
    filterTag: 'tray',
    price: '450.000 ₫',
    priceNum: 450000,
    unit: '/ Chiếc',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80',
    origin: 'Tre Già Tự Nhiên Xử Lý Hấp Sấy',
    standard: 'Chống mối mọt, kích thước gọn nhẹ 38x26cm',
    flavor: 'Thiết kế tối giản phong cách Zen Thiền Định',
    package: 'Hộp carton thân thiện môi trường',
    desc: 'Vẻ đẹp thanh tao, mộc mạc của tre già mang đến sự an yên, tĩnh tại. Rất phù hợp cho không gian thưởng trà ban công, phòng trà thiền định hoặc du trà dã ngoại.',
    icon: '🪵',
    reviews: [
      { author: 'Chị Mai Lan Anh (Đà Lạt)', date: '19/07/2026', stars: 5, text: 'Khay tre rất nhẹ và sạch sẽ, lau chùi nhanh khô, mang đi du lịch rất tiện.' }
    ]
  },

  // 4. Dụng Cụ Thưởng Trà
  'tw-11': {
    id: 'tw-11',
    title: 'Bộ Dụng Cụ Gắp Trà 6 Món Gỗ Mun',
    category: 'Dụng Cụ Thưởng Trà',
    categoryType: 'teaware',
    filterTag: 'tools',
    price: '380.000 ₫',
    priceNum: 380000,
    unit: '/ Bộ 6 Món',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=600&q=80',
    origin: 'Thủ công mỹ nghệ truyền thống',
    standard: 'Gỗ mun sừng tự nhiên đánh bóng mịn màng',
    flavor: 'Đầy đủ ống đựng, kẹp gắp chén, thìa xúc trà, thông vòi, phễu rót và cọ dưỡng ấm',
    package: 'Hộp giấy mỹ thuật trang nhã',
    desc: 'Bộ trà đạo lục đạo 6 món từ gỗ mun sừng cao cấp, là trợ thủ đắc lực không thể thiếu trên bàn trà để giữ cho việc pha trà luôn thanh tịnh, vệ sinh và đạt chuẩn quy cách tao nhã.',
    icon: '🥢',
    reviews: [
      { author: 'Anh Phan Thanh Sơn (Bắc Ninh)', date: '28/07/2026', stars: 5, text: 'Các chi tiết gia công rất nhẵn bóng, cầm nhẹ tay và không làm xước men chén hay ấm tử sa.' }
    ]
  },
  'tw-12': {
    id: 'tw-12',
    title: 'Bộ Lọc Trà & Thuyền Trà Bằng Đồng Thủ Công',
    category: 'Dụng Cụ Thưởng Trà',
    categoryType: 'teaware',
    filterTag: 'tools',
    price: '320.000 ₫',
    priceNum: 320000,
    unit: '/ Bộ 2 Món',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
    origin: 'Đồng Đỏ Nguyên Chất Gò Tay',
    standard: 'Lưới lọc inox 304 siêu mịn 200 mesh',
    flavor: 'Lọc sạch cặn mịn, nước trà trong vắt tuyệt đối',
    package: 'Hộp quà biếu thủ công',
    desc: 'Dụng cụ lọc trà bằng đồng đúc hoa văn sen cổ truyền, lưới lọc 2 lớp siêu mịn giúp loại bỏ toàn bộ vụn trà nhỏ, mang đến chén nước trong xanh như ngọc bích.',
    icon: '🥢',
    reviews: [
      { author: 'Bác Đinh Trọng Hùng (Hà Nội)', date: '16/07/2026', stars: 5, text: 'Lọc trà rất sạch cặn, nước trà rót ra chén trong vắt không một hạt bụi trà nào lọt qua.' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. AUTH GATEKEEPER & REDIRECTION
  // --------------------------------------------------------------------------
  const currentPath = window.location.pathname.toLowerCase();
  const isAuthPage = currentPath.endsWith('auth.html') || currentPath.endsWith('auth');
  const isLoggedIn = localStorage.getItem('tra_dao_is_logged_in') === 'true';
  const userRole = localStorage.getItem('tra_dao_user_role') || 'user';
  const userName = localStorage.getItem('tra_dao_user_name') || 'Khách Quý';

  // If not logged in and not on auth page, redirect to auth.html
  if (!isLoggedIn && !isAuthPage) {
    window.location.href = 'auth.html';
    return;
  }

  // Update Header Auth Button depending on role
  const navAuth = document.getElementById('navAuth');
  const navAuthText = document.getElementById('navAuthText');
  if (navAuth && navAuthText) {
    if (isLoggedIn) {
      if (userRole === 'admin') {
        navAuthText.textContent = 'QUẢN TRỊ';
        navAuth.href = 'admin.html';
        navAuth.title = 'Chuyển vào Admin Dashboard';
      } else {
        navAuthText.textContent = userName.split(' ')[0] || 'TÀI KHOẢN';
        navAuth.href = '#';
        navAuth.title = `Hồ sơ cá nhân: ${userName} (Click để xem & chỉnh sửa)`;
        navAuth.addEventListener('click', (e) => {
          e.preventDefault();
          openUserProfileModal();
        });
      }
    } else {
      navAuthText.textContent = 'ĐĂNG NHẬP';
      navAuth.href = 'auth.html';
    }
  }

  // --------------------------------------------------------------------------
  // USER ACCOUNT PROFILE MODAL CONTROLLER
  // --------------------------------------------------------------------------
  function createProfileModalDOM() {
    if (document.getElementById('userProfileModalBackdrop')) return;

    const savedName = localStorage.getItem('tra_dao_user_name') || 'Khách Quý';
    const savedEmail = localStorage.getItem('tra_dao_user_email') || 'khachhang@gmail.com';
    const savedPhone = localStorage.getItem('tra_dao_user_phone') || '0912 345 678';
    const savedAddress = localStorage.getItem('tra_dao_user_address') || 'Số 18, Phố Tràng Tiền, Hoàn Kiếm, Hà Nội';
    const savedNote = localStorage.getItem('tra_dao_user_note') || 'Thích phẩm Trà Đinh và Trà Nõn Tôm đậm đà truyền thống';
    const initial = (savedName.trim()[0] || 'K').toUpperCase();

    const backdrop = document.createElement('div');
    backdrop.className = 'user-profile-modal-backdrop';
    backdrop.id = 'userProfileModalBackdrop';
    backdrop.innerHTML = `
      <div class="user-profile-modal" role="dialog" aria-modal="true" aria-labelledby="profileModalTitle">
        <!-- Modal Header -->
        <div class="profile-modal-header">
          <div class="profile-header-top">
            <h3 class="profile-header-title" id="profileModalTitle">
              <span>🍵</span>
              <span>Hồ Sơ Tài Khoản Khách Hàng</span>
            </h3>
            <button class="profile-close-btn" id="closeProfileModalBtn" aria-label="Đóng">✕</button>
          </div>

          <div class="profile-user-card">
            <div class="profile-avatar-circle" id="profileAvatarInitial">${initial}</div>
            <div class="profile-user-details">
              <h4 class="profile-user-name" id="profileDisplayUserName">${savedName}</h4>
              <span class="profile-user-email" id="profileDisplayEmail">${savedEmail}</span>
              <div class="profile-member-badge">
                <span>★</span>
                <span>Hội Viên Hoàng Kim • 1.250 Điểm Thưởng Trà</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="profile-nav-tabs">
          <button class="profile-tab-btn active" data-tab="tabProfileInfo">
            <span>👤</span>
            <span>Thông Tin Cá Nhân</span>
          </button>
          <button class="profile-tab-btn" data-tab="tabProfileOrders">
            <span>📦</span>
            <span>Lịch Sử Đơn Hàng</span>
          </button>
          <button class="profile-tab-btn" data-tab="tabProfileSecurity">
            <span>🔒</span>
            <span>Bảo Mật</span>
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="profile-modal-body">
          
          <!-- TAB 1: THÔNG TIN CÁ NHÂN -->
          <div class="profile-tab-pane active" id="tabProfileInfo">
            <form id="profileEditForm">
              <div class="profile-form-grid">
                <div class="profile-form-group">
                  <label class="profile-label" for="profileInputName">Họ và tên của quý khách</label>
                  <input type="text" id="profileInputName" class="profile-input" value="${savedName}" required>
                </div>

                <div class="profile-form-group">
                  <label class="profile-label" for="profileInputPhone">Số điện thoại liên hệ</label>
                  <input type="tel" id="profileInputPhone" class="profile-input" value="${savedPhone}" required>
                </div>

                <div class="profile-form-group full-width">
                  <label class="profile-label" for="profileInputEmail">Địa chỉ Email</label>
                  <input type="email" id="profileInputEmail" class="profile-input" value="${savedEmail}" required>
                </div>

                <div class="profile-form-group full-width">
                  <label class="profile-label" for="profileInputAddress">Địa chỉ nhận hàng mặc định</label>
                  <input type="text" id="profileInputAddress" class="profile-input" value="${savedAddress}" required>
                </div>

                <div class="profile-form-group full-width">
                  <label class="profile-label" for="profileInputNote">Ghi chú khẩu vị & Gu thưởng trà</label>
                  <textarea id="profileInputNote" class="profile-textarea" rows="2">${savedNote}</textarea>
                </div>
              </div>
            </form>
          </div>

          <!-- TAB 2: LỊCH SỬ ĐƠN HÀNG -->
          <div class="profile-tab-pane" id="tabProfileOrders">
            <div class="profile-orders-list">
              
              <div class="profile-order-card">
                <div class="order-info-left">
                  <div class="order-code-row">
                    <span class="order-code">#TN-9824</span>
                    <span class="order-date">18/08/2026</span>
                  </div>
                  <span class="order-items-preview">2x Trà Đinh Tân Cương Thượng Hạng (Hộp 500g)</span>
                </div>
                <div class="order-info-right">
                  <span class="order-total-price">3.000.000 ₫</span>
                  <span class="order-status-badge completed">✓ Đã giao thành công</span>
                </div>
              </div>

              <div class="profile-order-card">
                <div class="order-info-left">
                  <div class="order-code-row">
                    <span class="order-code">#TN-9710</span>
                    <span class="order-date">05/08/2026</span>
                  </div>
                  <span class="order-items-preview">1x Ấm Tử Sa Thạch Biều + 1x Trà Nõn Tôm</span>
                </div>
                <div class="order-info-right">
                  <span class="order-total-price">2.650.000 ₫</span>
                  <span class="order-status-badge completed">✓ Đã giao thành công</span>
                </div>
              </div>

              <div class="profile-order-card">
                <div class="order-info-left">
                  <div class="order-code-row">
                    <span class="order-code">#TN-9952</span>
                    <span class="order-date">21/08/2026</span>
                  </div>
                  <span class="order-items-preview">1x Hộp Quà Biếu Trà Đinh Lót Lụa Thượng Hạng</span>
                </div>
                <div class="order-info-right">
                  <span class="order-total-price">1.650.000 ₫</span>
                  <span class="order-status-badge shipping">🚚 Đang vận chuyển</span>
                </div>
              </div>

            </div>
          </div>

          <!-- TAB 3: BẢO MẬT -->
          <div class="profile-tab-pane" id="tabProfileSecurity">
            <form id="profileSecurityForm">
              <div class="profile-form-grid">
                <div class="profile-form-group full-width">
                  <label class="profile-label" for="pwdCurrent">Mật khẩu hiện tại</label>
                  <input type="password" id="pwdCurrent" class="profile-input" placeholder="Nhập mật khẩu hiện tại...">
                </div>
                <div class="profile-form-group">
                  <label class="profile-label" for="pwdNew">Mật khẩu mới</label>
                  <input type="password" id="pwdNew" class="profile-input" placeholder="Tối thiểu 6 ký tự...">
                </div>
                <div class="profile-form-group">
                  <label class="profile-label" for="pwdConfirm">Xác nhận mật khẩu mới</label>
                  <input type="password" id="pwdConfirm" class="profile-input" placeholder="Nhập lại mật khẩu mới...">
                </div>
              </div>
            </form>
          </div>

        </div>

        <!-- Modal Footer Actions -->
        <div class="profile-modal-footer">
          <button type="button" class="btn-profile-logout" id="btnProfileLogout">
            <span>🚪</span>
            <span>ĐĂNG XUẤT TÀI KHOẢN</span>
          </button>

          <button type="button" class="btn-profile-save" id="btnProfileSave">
            <span>💾</span>
            <span>LƯU THAY ĐỔI</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Event Listeners for Modal
    const closeBtn = document.getElementById('closeProfileModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeUserProfileModal);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeUserProfileModal();
    });

    // Tab Switching inside Profile Modal
    const tabBtns = backdrop.querySelectorAll('.profile-tab-btn');
    const tabPanes = backdrop.querySelectorAll('.profile-tab-pane');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');

        // Hide Save button in orders tab, show in info/security tabs
        const saveBtn = document.getElementById('btnProfileSave');
        if (saveBtn) {
          saveBtn.style.display = targetId === 'tabProfileOrders' ? 'none' : 'inline-flex';
        }
      });
    });

    // Save Changes Handler
    const saveBtn = document.getElementById('btnProfileSave');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const activeTab = backdrop.querySelector('.profile-tab-btn.active')?.getAttribute('data-tab');

        if (activeTab === 'tabProfileSecurity') {
          const pwdCurrent = document.getElementById('pwdCurrent').value;
          const pwdNew = document.getElementById('pwdNew').value;
          const pwdConfirm = document.getElementById('pwdConfirm').value;

          if (!pwdCurrent || !pwdNew || !pwdConfirm) {
            window.showToast('Vui lòng điền đầy đủ các trường mật khẩu.');
            return;
          }
          if (pwdNew !== pwdConfirm) {
            window.showToast('Mật khẩu xác nhận không khớp.');
            return;
          }

          window.showToast('Cập nhật mật khẩu mới thành công!');
          document.getElementById('pwdCurrent').value = '';
          document.getElementById('pwdNew').value = '';
          document.getElementById('pwdConfirm').value = '';
          return;
        }

        // Save Information
        const nameVal = document.getElementById('profileInputName').value.trim();
        const phoneVal = document.getElementById('profileInputPhone').value.trim();
        const emailVal = document.getElementById('profileInputEmail').value.trim();
        const addrVal = document.getElementById('profileInputAddress').value.trim();
        const noteVal = document.getElementById('profileInputNote').value.trim();

        if (!nameVal || !phoneVal || !emailVal) {
          window.showToast('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email.');
          return;
        }

        localStorage.setItem('tra_dao_user_name', nameVal);
        localStorage.setItem('tra_dao_user_phone', phoneVal);
        localStorage.setItem('tra_dao_user_email', emailVal);
        localStorage.setItem('tra_dao_user_address', addrVal);
        localStorage.setItem('tra_dao_user_note', noteVal);

        // Update UI
        document.getElementById('profileDisplayUserName').textContent = nameVal;
        document.getElementById('profileDisplayEmail').textContent = emailVal;
        document.getElementById('profileAvatarInitial').textContent = (nameVal[0] || 'K').toUpperCase();
        if (navAuthText) navAuthText.textContent = nameVal.split(' ')[0] || 'TÀI KHOẢN';

        window.showToast('Đã lưu thông tin tài khoản thành công!');
      });
    }

    // Logout Handler: Khi click Đăng Xuất sẽ out ngay về giao diện Đăng Nhập (auth.html)
    const logoutBtn = document.getElementById('btnProfileLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('tra_dao_is_logged_in');
        localStorage.removeItem('tra_dao_user_role');
        localStorage.removeItem('tra_dao_user_name');
        localStorage.removeItem('tra_dao_user_email');
        localStorage.removeItem('tra_dao_user_phone');
        localStorage.removeItem('tra_dao_user_address');
        window.location.replace('auth.html');
      });
    }
  }

  function openUserProfileModal() {
    createProfileModalDOM();
    const backdrop = document.getElementById('userProfileModalBackdrop');
    if (backdrop) {
      // Reload current values
      const currentName = localStorage.getItem('tra_dao_user_name') || 'Khách Quý';
      const currentPhone = localStorage.getItem('tra_dao_user_phone') || '0912 345 678';
      const currentEmail = localStorage.getItem('tra_dao_user_email') || 'khachhang@gmail.com';
      const currentAddress = localStorage.getItem('tra_dao_user_address') || 'Số 18, Phố Tràng Tiền, Hoàn Kiếm, Hà Nội';
      const currentNote = localStorage.getItem('tra_dao_user_note') || 'Thích phẩm Trà Đinh và Trà Nõn Tôm đậm đà truyền thống';

      const inputName = document.getElementById('profileInputName');
      const inputPhone = document.getElementById('profileInputPhone');
      const inputEmail = document.getElementById('profileInputEmail');
      const inputAddress = document.getElementById('profileInputAddress');
      const inputNote = document.getElementById('profileInputNote');

      if (inputName) inputName.value = currentName;
      if (inputPhone) inputPhone.value = currentPhone;
      if (inputEmail) inputEmail.value = currentEmail;
      if (inputAddress) inputAddress.value = currentAddress;
      if (inputNote) inputNote.value = currentNote;

      const dispName = document.getElementById('profileDisplayUserName');
      const dispEmail = document.getElementById('profileDisplayEmail');
      const dispAvatar = document.getElementById('profileAvatarInitial');
      if (dispName) dispName.textContent = currentName;
      if (dispEmail) dispEmail.textContent = currentEmail;
      if (dispAvatar) dispAvatar.textContent = (currentName[0] || 'K').toUpperCase();

      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeUserProfileModal() {
    const backdrop = document.getElementById('userProfileModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  window.openUserProfileModal = openUserProfileModal;
  window.closeUserProfileModal = closeUserProfileModal;

  // --------------------------------------------------------------------------
  // 2. TOAST NOTIFICATION UTILITY
  // --------------------------------------------------------------------------
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.id = 'toastNotification';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = '<span class="toast-icon">✓</span><span class="toast-message" id="toastMessage">Thông báo</span>';
    document.body.appendChild(toast);
  }
  const toastMsg = document.getElementById('toastMessage');

  window.showToast = function(message) {
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  // --------------------------------------------------------------------------
  // 3. FLOATING CONTACT CHAT WIDGET (ZALO & MESSENGER & DIRECT CHAT)
  // --------------------------------------------------------------------------
  if (!isAuthPage) {
    let chatWidget = document.getElementById('floatingContactWidget');
    if (!chatWidget) {
      chatWidget = document.createElement('div');
      chatWidget.id = 'floatingContactWidget';
      chatWidget.className = 'floating-contact-widget';
      chatWidget.innerHTML = `
        <!-- Quick Chat Popup Box -->
        <div class="chat-popup-box" id="chatPopupBox">
          <div class="chat-popup-header">
            <div class="chat-popup-title">
              <span>🍵</span>
              <span>Trợ Lý Trà Đạo 24/7</span>
            </div>
            <button type="button" class="chat-popup-close" id="closeChatPopupBtn">&times;</button>
          </div>
          <div class="chat-popup-body">
            <p>Kính chào quý khách! Quý khách cần tư vấn chọn trà biếu, hướng dẫn pha trà hay kiểm tra đơn hàng?</p>
            <textarea class="chat-quick-input" id="chatQuickMsg" rows="2" placeholder="Nhập câu hỏi hoặc số điện thoại của bạn..."></textarea>
            <div class="chat-popup-actions">
              <button type="button" class="btn-send-zalo" id="btnSendZalo">
                <span>💬 Nhắn Zalo</span>
              </button>
              <button type="button" class="btn-send-mess" id="btnSendMess">
                <span>⚡ Messenger</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Floating Contact Action Bubbles -->
        <div class="floating-contact-buttons">
          <!-- Zalo Chat -->
          <a href="https://zalo.me/0903741701" target="_blank" rel="noopener noreferrer" class="contact-bubble bubble-zalo" id="bubbleZalo" title="Chat trực tiếp qua Zalo">
            <span class="bubble-label">Chat Zalo Trực Tiếp</span>
            <div class="bubble-icon">
              <svg viewBox="0 0 48 48">
                <path d="M24 4C12.95 4 4 12.51 4 23c0 4.14 1.41 7.97 3.82 11.08L6 44l10.45-2.61C18.84 42.42 21.36 43 24 43c11.05 0 20-8.51 20-19S35.05 4 24 4z"/>
              </svg>
            </div>
          </a>

          <!-- Messenger Chat -->
          <a href="https://m.me" target="_blank" rel="noopener noreferrer" class="contact-bubble bubble-messenger" id="bubbleMessenger" title="Chat qua Facebook Messenger">
            <span class="bubble-label">Nhắn Tin Messenger</span>
            <div class="bubble-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.913 1.455 5.513 3.735 7.218V22l3.355-1.843c.925.257 1.905.394 2.91.394 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.042 12.443l-2.584-2.757-5.042 2.757 5.542-5.885 2.658 2.757 4.968-2.757-5.542 5.885z"/>
              </svg>
            </div>
          </a>

          <!-- Phone Hotline Call -->
          <a href="tel:0903741701" class="contact-bubble bubble-phone" id="bubblePhone" title="Gọi Hotline: 0903.741.701">
            <span class="bubble-label">Hotline: 0903.741.701</span>
            <div class="bubble-icon">
              <svg viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z"/>
              </svg>
            </div>
          </a>
        </div>
      `;
      document.body.appendChild(chatWidget);

      // Popup controls
      const chatPopupBox = document.getElementById('chatPopupBox');
      const closeChatPopupBtn = document.getElementById('closeChatPopupBtn');
      const chatQuickMsg = document.getElementById('chatQuickMsg');
      const btnSendZalo = document.getElementById('btnSendZalo');
      const btnSendMess = document.getElementById('btnSendMess');

      if (closeChatPopupBtn && chatPopupBox) {
        closeChatPopupBtn.addEventListener('click', () => {
          chatPopupBox.classList.remove('active');
        });
      }

      if (btnSendZalo) {
        btnSendZalo.addEventListener('click', () => {
          const msg = encodeURIComponent(chatQuickMsg.value.trim() || 'Xin chào, tôi cần tư vấn về sản phẩm trà');
          window.open(`https://zalo.me/0903741701?text=${msg}`, '_blank');
          chatPopupBox.classList.remove('active');
        });
      }

      if (btnSendMess) {
        btnSendMess.addEventListener('click', () => {
          window.open('https://m.me', '_blank');
          chatPopupBox.classList.remove('active');
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. CART SYSTEM WITH LUXURY SLIDE-IN DRAWER
  // --------------------------------------------------------------------------
  let cartItems = JSON.parse(localStorage.getItem('tra_dao_cart_items') || '[]');

  function updateCartBadge() {
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
      cartCountEl.textContent = totalCount;
      cartCountEl.style.transform = 'scale(1.35)';
      setTimeout(() => {
        cartCountEl.style.transform = 'scale(1)';
      }, 250);
    }
    localStorage.setItem('tra_dao_cart_count', totalCount.toString());
  }

  // Build / Inject Slide-in Cart Drawer DOM
  let cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');
  if (!cartDrawerBackdrop && !isAuthPage) {
    cartDrawerBackdrop = document.createElement('div');
    cartDrawerBackdrop.id = 'cartDrawerBackdrop';
    cartDrawerBackdrop.className = 'cart-drawer-backdrop';
    cartDrawerBackdrop.innerHTML = `
      <div class="cart-drawer-card" id="cartDrawerCard">
        <div class="cart-drawer-header">
          <h2 class="cart-drawer-title">
            <span>🛒</span>
            <span>Giỏ Hàng Của Quý Khách</span>
          </h2>
          <button type="button" class="cart-drawer-close" id="cartDrawerCloseBtn" aria-label="Đóng giỏ hàng">&times;</button>
        </div>
        
        <div class="cart-drawer-body" id="cartDrawerBody">
          <!-- Injected via renderCartDrawer() -->
        </div>

        <div class="cart-drawer-footer" id="cartDrawerFooter">
          <div class="cart-total-row">
            <span class="cart-total-label">Tổng cộng tạm tính:</span>
            <span class="cart-total-val" id="cartTotalVal">0 ₫</span>
          </div>
          <button type="button" class="btn-cart-checkout" id="btnCartCheckout">
            <span>TIẾN HÀNH ĐẶT HÀNG</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(cartDrawerBackdrop);
  }

  function formatPriceVND(num) {
    return num.toLocaleString('vi-VN') + ' ₫';
  }

  function renderCartDrawer() {
    const drawerBody = document.getElementById('cartDrawerBody');
    const drawerFooter = document.getElementById('cartDrawerFooter');
    const cartTotalVal = document.getElementById('cartTotalVal');
    if (!drawerBody) return;

    if (cartItems.length === 0) {
      drawerBody.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🍵</div>
          <h3 class="cart-empty-title">Giỏ hàng đang trống</h3>
          <p class="cart-empty-text">Kính mời quý khách khám phá các danh trà và trà cụ thượng hạng của chúng tôi.</p>
          <a href="products.html" class="btn-shop-now" id="btnDrawerShopNow">KHÁM PHÁ SẢN PHẨM</a>
        </div>
      `;
      if (drawerFooter) drawerFooter.style.display = 'none';
      return;
    }

    if (drawerFooter) drawerFooter.style.display = 'block';

    let totalAmount = 0;
    let itemsHtml = '';

    cartItems.forEach((item, index) => {
      const itemSubtotal = item.priceNum * item.quantity;
      totalAmount += itemSubtotal;

      const thumbImg = item.image ? `<img src="${item.image}" alt="${item.title}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">` : (item.icon || '🍵');

      itemsHtml += `
        <div class="cart-item-row" data-index="${index}">
          <div class="cart-item-thumb">${thumbImg}</div>
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.title}</h4>
            <div class="cart-item-price">${formatPriceVND(item.priceNum)}</div>
            <div class="cart-item-bottom">
              <div class="cart-qty-ctrl">
                <button type="button" class="cart-qty-btn btn-cart-minus" data-index="${index}">-</button>
                <span class="cart-qty-val">${item.quantity}</span>
                <button type="button" class="cart-qty-btn btn-cart-plus" data-index="${index}">+</button>
              </div>
              <button type="button" class="cart-item-remove" data-index="${index}">Xóa</button>
            </div>
          </div>
        </div>
      `;
    });

    drawerBody.innerHTML = itemsHtml;
    if (cartTotalVal) cartTotalVal.textContent = formatPriceVND(totalAmount);

    // Attach row events
    drawerBody.querySelectorAll('.btn-cart-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (cartItems[idx].quantity > 1) {
          cartItems[idx].quantity -= 1;
        } else {
          cartItems.splice(idx, 1);
        }
        saveAndSyncCart();
      });
    });

    drawerBody.querySelectorAll('.btn-cart-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        cartItems[idx].quantity += 1;
        saveAndSyncCart();
      });
    });

    drawerBody.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const name = cartItems[idx]?.title;
        cartItems.splice(idx, 1);
        saveAndSyncCart();
        showToast(`Đã xóa "${name}" khỏi giỏ hàng.`);
      });
    });
  }

  function saveAndSyncCart() {
    localStorage.setItem('tra_dao_cart_items', JSON.stringify(cartItems));
    updateCartBadge();
    renderCartDrawer();
  }

  function openCartDrawer() {
    if (cartDrawerBackdrop) {
      renderCartDrawer();
      cartDrawerBackdrop.classList.add('active');
    }
  }

  function closeCartDrawer() {
    if (cartDrawerBackdrop) {
      cartDrawerBackdrop.classList.remove('active');
    }
  }

  // Global Add to Cart
  window.addToCart = function(productNameOrId = '1', quantity = 1) {
    let pData = MASTER_PRODUCTS[productNameOrId];
    if (!pData) {
      pData = Object.values(MASTER_PRODUCTS).find(p => p.title.toLowerCase() === productNameOrId.toLowerCase()) || {
        id: 'custom',
        title: productNameOrId,
        price: '1.500.000 ₫',
        priceNum: 1500000,
        icon: '🍵'
      };
    }

    const existingIndex = cartItems.findIndex(item => item.title === pData.title);
    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += quantity;
    } else {
      cartItems.push({
        id: pData.id,
        title: pData.title,
        priceNum: pData.priceNum || 1500000,
        image: pData.image || null,
        icon: pData.icon || '🍵',
        quantity: quantity
      });
    }

    saveAndSyncCart();
    showToast(`Đã thêm ${quantity}x "${pData.title}" vào giỏ hàng!`);
    openCartDrawer();
  };

  // Attach Cart Open / Close
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'cartDrawerCloseBtn') {
      closeCartDrawer();
    }
    if (e.target && e.target === cartDrawerBackdrop) {
      closeCartDrawer();
    }
    if (e.target && e.target.id === 'btnCartCheckout') {
      showToast('Đơn hàng của quý khách đã được tiếp nhận! Nhân viên sẽ gọi điện xác nhận trong 5 phút.');
      cartItems = [];
      saveAndSyncCart();
      setTimeout(closeCartDrawer, 1200);
    }
  });

  // Init cart state on load
  updateCartBadge();

  // --------------------------------------------------------------------------
  // 4B. SLIDER CONTROLLERS (KHỐI 2 - TEA SLIDER & KHỐI 5 - TEAWARE SLIDER)
  // --------------------------------------------------------------------------
  function setupBrandSlider(sliderId, dotsId, progressId, intervalMs = 3000) {
    const sliderEl = document.getElementById(sliderId);
    if (!sliderEl) return;

    const slides = sliderEl.querySelectorAll('.slide');
    const dots = document.querySelectorAll(`#${dotsId} .dot`);
    const progressBar = document.getElementById(progressId);
    if (!slides.length) return;

    let currentIndex = 0;
    let timer = null;

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      resetProgressBar();
    }

    function resetProgressBar() {
      if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        setTimeout(() => {
          progressBar.style.transition = `width ${intervalMs}ms linear`;
          progressBar.style.width = '100%';
        }, 30);
      }
    }

    function startAutoPlay() {
      stopAutoPlay();
      resetProgressBar();
      timer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, intervalMs);
    }

    function stopAutoPlay() {
      if (timer) clearInterval(timer);
      if (progressBar) {
        progressBar.style.transition = 'none';
      }
    }

    // Attach Dot Clicks
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
        startAutoPlay();
      });
    });

    // Pause on hover
    sliderEl.addEventListener('mouseenter', stopAutoPlay);
    sliderEl.addEventListener('mouseleave', startAutoPlay);

    // Initial Start
    startAutoPlay();
  }

  setupBrandSlider('teaSlider', 'teaSliderDots', 'teaProgress', 3000);
  setupBrandSlider('teawareSlider', 'teawareSliderDots', 'teawareProgress', 3000);

  // --------------------------------------------------------------------------
  // 5. NAVIGATION HOOKS: "XEM CHI TIẾT" -> Open product-detail.html
  // --------------------------------------------------------------------------
  const detailButtons = document.querySelectorAll('.btn-scroll-detail, .btn-card-detail, .btn-teaware-detail, .btn-editorial-detail, .stacked-link');
  detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target') || '1';
      localStorage.setItem('tra_dao_selected_product_id', targetId);
      window.location.href = `product-detail.html?id=${targetId}`;
    });
  });

  // --------------------------------------------------------------------------
  // 6. DYNAMIC PRODUCT DETAIL PAGE LOGIC (product-detail.html)
  // --------------------------------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');
  const hashId = window.location.hash ? window.location.hash.replace('#', '').replace('id=', '') : null;
  const storedId = localStorage.getItem('tra_dao_selected_product_id');

  const activeId = paramId || hashId || storedId || '1';
  const productData = MASTER_PRODUCTS[activeId] || MASTER_PRODUCTS['1'];

  const detailTitle = document.getElementById('detailTitle');
  if (detailTitle) {
    document.title = `${productData.title} | Trà Đạo Thái Nguyên`;
    detailTitle.textContent = productData.title;

    const detailCategory = document.getElementById('detailCategory');
    if (detailCategory) detailCategory.textContent = productData.category;

    const detailPrice = document.getElementById('detailPrice');
    if (detailPrice) detailPrice.textContent = productData.price;

    const detailUnit = document.getElementById('detailUnit');
    if (detailUnit) detailUnit.textContent = productData.unit;

    const detailDesc = document.getElementById('detailDesc');
    if (detailDesc) detailDesc.textContent = productData.desc;

    const specOrigin = document.getElementById('specOrigin');
    if (specOrigin) specOrigin.textContent = productData.origin;

    const specStandard = document.getElementById('specStandard');
    if (specStandard) specStandard.textContent = productData.standard;

    const specFlavor = document.getElementById('specFlavor');
    if (specFlavor) specFlavor.textContent = productData.flavor;

    const specPackage = document.getElementById('specPackage');
    if (specPackage) specPackage.textContent = productData.package;

    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = productData.categoryType === 'teaware' ? 'Trà Cụ Nghệ Nhân' : 'Sản Phẩm Trà';
      breadcrumbCategory.href = productData.categoryType === 'teaware' ? 'teaware.html' : 'products.html';
    }

    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = productData.title;

    // Render Canvas Real Image / Artwork
    const mainArtCanvas = document.getElementById('mainArtCanvas');
    if (mainArtCanvas) {
      const imgSrc = productData.image || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80';
      mainArtCanvas.innerHTML = `
        <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:10px;">
          <img src="${imgSrc}" alt="${productData.title}" style="max-width:100%; max-height:380px; object-fit:cover; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.5);">
        </div>
      `;
    }

    // Thumbnail Gallery Switcher
    const thumbCards = document.querySelectorAll('.thumb-card');
    thumbCards.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbCards.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        showToast('Đang chuyển đổi góc nhìn sản phẩm...');
      });
    });

    // Quantity Selector
    const qtyInput = document.getElementById('detailQuantity');
    const qtyMinusBtn = document.getElementById('qtyMinusBtn');
    const qtyPlusBtn = document.getElementById('qtyPlusBtn');

    if (qtyMinusBtn && qtyInput) {
      qtyMinusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value || '1', 10);
        if (val > 1) qtyInput.value = val - 1;
      });
    }
    if (qtyPlusBtn && qtyInput) {
      qtyPlusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value || '1', 10);
        if (val < 99) qtyInput.value = val + 1;
      });
    }

    // Add to Cart & Buy Now in Detail Page
    const detailAddToCartBtn = document.getElementById('detailAddToCartBtn');
    const detailBuyNowBtn = document.getElementById('detailBuyNowBtn');

    if (detailAddToCartBtn) {
      detailAddToCartBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput?.value || '1', 10);
        addToCart(activeId, qty);
      });
    }

    if (detailBuyNowBtn) {
      detailBuyNowBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput?.value || '1', 10);
        addToCart(activeId, qty);
      });
    }

    // Render Product Reviews
    const feedbackList = document.getElementById('feedbackReviewsList');
    if (feedbackList && productData.reviews) {
      feedbackList.innerHTML = '';
      productData.reviews.forEach(rev => {
        const initials = rev.author.substring(0, 2).toUpperCase();
        let starsStr = '';
        for (let i = 0; i < rev.stars; i++) starsStr += '★';

        const revCard = document.createElement('article');
        revCard.className = 'feedback-card';
        revCard.innerHTML = `
          <div class="reviewer-avatar">
            <span>${initials}</span>
          </div>
          <div class="feedback-content">
            <div class="feedback-top-row">
              <div class="reviewer-identity">
                <h4 class="author-name">${rev.author}</h4>
                <span class="verified-buyer">✔ Đã mua hàng chính hãng</span>
              </div>
              <div class="review-date">${rev.date}</div>
            </div>
            <div class="feedback-stars">${starsStr}</div>
            <p class="feedback-comment">${rev.text}</p>
          </div>
        `;
        feedbackList.appendChild(revCard);
      });
    }

    // Interactive Review Star Picker in Detail Page
    let currentDetailRating = 5;
    const detailStarPicker = document.getElementById('detailStarPicker');
    const pickerNote = document.getElementById('pickerNote');
    if (detailStarPicker) {
      const pickerStars = detailStarPicker.querySelectorAll('.picker-star');
      pickerStars.forEach(star => {
        star.addEventListener('click', () => {
          const r = parseInt(star.getAttribute('data-rating') || '5', 10);
          currentDetailRating = r;
          pickerStars.forEach(s => {
            const starVal = parseInt(s.getAttribute('data-rating') || '5', 10);
            if (starVal <= r) s.classList.add('active');
            else s.classList.remove('active');
          });
          if (pickerNote) {
            pickerNote.textContent = r === 5 ? 'Tuyệt hảo (5 sao)' : r === 4 ? 'Rất hài lòng (4 sao)' : `${r} sao`;
          }
        });
      });
    }

    // Submit New Review Form
    const productReviewForm = document.getElementById('productReviewForm');
    if (productReviewForm) {
      productReviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = document.getElementById('reviewAuthorName')?.value.trim();
        const comment = document.getElementById('reviewCommentText')?.value.trim();

        if (!author || !comment) return;

        let starsStr = '';
        for (let i = 0; i < currentDetailRating; i++) starsStr += '★';

        const initials = author.substring(0, 2).toUpperCase();
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

        const newReviewCard = document.createElement('article');
        newReviewCard.className = 'feedback-card';
        newReviewCard.style.opacity = '0';
        newReviewCard.style.transform = 'translateY(-10px)';
        newReviewCard.style.transition = 'all 0.4s ease';

        newReviewCard.innerHTML = `
          <div class="reviewer-avatar">
            <span>${initials}</span>
          </div>
          <div class="feedback-content">
            <div class="feedback-top-row">
              <div class="reviewer-identity">
                <h4 class="author-name">${author}</h4>
                <span class="verified-buyer">✔ Đã mua hàng chính hãng</span>
              </div>
              <div class="review-date">${dateStr}</div>
            </div>
            <div class="feedback-stars">${starsStr}</div>
            <p class="feedback-comment">${comment}</p>
          </div>
        `;

        if (feedbackList) {
          feedbackList.prepend(newReviewCard);
          setTimeout(() => {
            newReviewCard.style.opacity = '1';
            newReviewCard.style.transform = 'translateY(0)';
          }, 30);
        }

        productReviewForm.reset();
        showToast('Kính cảm ơn quý khách đã gửi đánh giá phẩm trà!');
      });
    }
  }

  // --------------------------------------------------------------------------
  // 7. PRODUCTS PAGE FILTERING (products.html)
  // --------------------------------------------------------------------------
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productItems = document.querySelectorAll('.product-item');

  if (filterTabs.length > 0 && productItems.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter') || 'all';

        productItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. TEAWARE PAGE FILTERING (teaware.html)
  // --------------------------------------------------------------------------
  const teawareFilterTabs = document.querySelectorAll('.teaware-filter-tab');
  const teawareCards = document.querySelectorAll('.teaware-card');

  if (teawareFilterTabs.length > 0 && teawareCards.length > 0) {
    teawareFilterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        teawareFilterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter') || 'all';

        teawareCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. HOMEPAGE SEARCH & REVIEW FORM
  // --------------------------------------------------------------------------
  const searchInput = document.getElementById('productSearchInput');
  const searchSubmitBtn = document.getElementById('searchSubmitBtn');
  const scrollCards = document.querySelectorAll('.scroll-card');

  function filterHomeProducts() {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();

    scrollCards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const type = (card.dataset.type || '').toLowerCase();
      if (!query || name.includes(query) || type.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchInput) searchInput.addEventListener('input', filterHomeProducts);
  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      filterHomeProducts();
    });
  }

  // Homepage Review Form
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reviewerName')?.value.trim();
      const comment = document.getElementById('reviewerComment')?.value.trim();
      const testimonialsList = document.getElementById('testimonialsList');

      if (!name || !comment) return;

      const newCard = document.createElement('article');
      newCard.className = 'review-card';
      newCard.innerHTML = `
        <div class="review-main">
          <h3 class="reviewer-name">${name}</h3>
          <p class="review-text">${comment}</p>
        </div>
        <div class="review-stars" aria-label="Đánh giá 5 sao">
          <span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span>
        </div>
      `;

      if (testimonialsList) {
        testimonialsList.prepend(newCard);
      }

      reviewForm.reset();
      showToast('Kính cảm ơn quý khách đã gửi cảm nhận thưởng trà!');
    });
  }

  // --------------------------------------------------------------------------
  // 10. CONTACT FORM SUBMISSION FIX (contact.html)
  // --------------------------------------------------------------------------
  const contactInquiryForm = document.getElementById('contactInquiryForm');
  if (contactInquiryForm) {
    contactInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('contactFullName')?.value.trim();
      const phone = document.getElementById('contactPhone')?.value.trim();
      const need = document.getElementById('contactNeed')?.value.trim() || 'Tư vấn trà';

      if (!fullName || !phone) {
        showToast('Vui lòng điền họ tên và số điện thoại liên hệ.');
        return;
      }

      showToast(`Kính cảm ơn quý khách ${fullName}! Yêu cầu tư vấn "${need}" đã được gửi. Nghệ nhân sẽ gọi số ${phone} trong 10 phút.`);
      contactInquiryForm.reset();
    });
  }
});
