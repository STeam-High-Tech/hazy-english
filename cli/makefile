

# Tạo môi trường ảo
venv:
	python3 -m venv venv
	. venv/bin/activate && pip install --upgrade pip

# Cài đặt các phụ thuộc
install_deps:
	. venv/bin/activate && pip install -r requirements.txt

build:
	pyinstaller --onefile \
		--name "hazy_eng" \
		--target-architecture arm64 \
		--osx-bundle-identifier com.hazy.english \
		hazy_eng.py

clean:
	rm -rf build
	rm -rf dist
